import React, {useEffect, useRef, useState} from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faTimes, faSpinner } from "@fortawesome/free-solid-svg-icons";
import type {AutocompleteItem, ItemListManagerProps} from "../types/interfaces.ts";

const ItemListManager: React.FC<ItemListManagerProps> = ({
                                                             title,
                                                             items,
                                                             placeholder,
                                                             icon,
                                                             category,
                                                             isLoading = false,
                                                             onAddItem,
                                                             onRemoveItem,
                                                             addButtonText,
                                                             className = ""
                                                         }) => {
    const [inputValue, setInputValue] = useState('');
    const [suggestions, setSuggestions] = useState<AutocompleteItem[]>([]);
    const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const suggestionTimeoutRef = useRef<number | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const getEntityType = (category: string) => {
        switch (category) {
            case 'artists' : return 'artist';
            case 'movies' : return 'movie';
            case 'books' : return 'book';
            default: return category
        }
    }

    const fetchSuggestions = async (query: string) => {
        if (query.length < 2) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        setIsLoadingSuggestions(true);
        try {
            const entityType = getEntityType(category);
            const response = await fetch(
                `http://localhost:8001/api/qloo/search?query=${encodeURIComponent(query)}&limit=3&entity_type=${entityType}`
            );

            if(response.ok) {
                const data = await response.json()
                setSuggestions(Array.isArray(data) ? data : [])
                setShowSuggestions(true)
                setSelectedIndex(-1)
            }
        } catch {
            setSuggestions([])
        }
        finally {
            setIsLoadingSuggestions(false);
        }
    }

    useEffect(() => {
        if(suggestionTimeoutRef.current) {
            clearTimeout(suggestionTimeoutRef.current);
        }

        suggestionTimeoutRef.current = setTimeout(() => {
            fetchSuggestions(inputValue);
        }, 300)

        return ( ) => {
            if(suggestionTimeoutRef.current) {
                clearTimeout(suggestionTimeoutRef.current);
            }
        };
    }, [inputValue, category])

    const handleAddClick = () => {
        if (inputValue.trim() !== '') {
            onAddItem(category, inputValue.trim());
            setInputValue('');
            setSuggestions([]);
            setShowSuggestions(false);
        }
    };

    const handleSuggestionClick = (suggestion: AutocompleteItem) => {
        onAddItem(category, suggestion.name);
        setInputValue('');
        setSuggestions([]);
        setShowSuggestions(false);
        inputRef.current?.focus();
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (selectedIndex >= 0 && suggestions[selectedIndex]) {
                handleSuggestionClick(suggestions[selectedIndex]);
            } else {
                handleAddClick();
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev =>
                prev < suggestions.length - 1 ? prev + 1 : prev
            );
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        } else if (e.key === 'Escape') {
            setShowSuggestions(false);
            setSelectedIndex(-1);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
        if (!showSuggestions && e.target.value.length >= 2) {
            setShowSuggestions(true);
        }
    };

    const handleInputBlur = () => {
        setTimeout(() => {
            setShowSuggestions(false);
            setSelectedIndex(-1);
        }, 200);
    };

    const nonEmptyItems = items.filter(item => item.trim() !== '');

    return (
        <div className={`form-section ${className}`}>
            <h3 className="form-section-title">
                <FontAwesomeIcon icon={icon} />
                {title}
            </h3>

            <div className="add-item-section">
                <div className="autocomplete-container">
                    <div className="input-group">
                        <div className="input-wrapper">
                            <input
                                ref={inputRef}
                                type="text"
                                value={inputValue}
                                disabled={isLoading}
                                onChange={handleInputChange}
                                onKeyDown={handleKeyPress}
                                onBlur={handleInputBlur}
                                onFocus={() => inputValue.length >= 2 && setShowSuggestions(true)}
                                placeholder={placeholder}
                                className="profile-input"
                                autoComplete="off"
                            />
                            {isLoadingSuggestions && (
                                <div className="loading-indicator">
                                    <FontAwesomeIcon icon={faSpinner} className="fa-spin" />
                                </div>
                            )}
                        </div>
                        <button
                            type="button"
                            disabled={isLoading || inputValue.trim() === ''}
                            onClick={handleAddClick}
                            className="add-btn"
                        >
                            <FontAwesomeIcon icon={faPlus} />
                            {addButtonText}
                        </button>
                    </div>

                    {showSuggestions && suggestions.length > 0 && (
                        <div className="autocomplete-suggestions">
                            {suggestions.map((suggestion, index) => (
                                <div
                                    key={suggestion.entityId}
                                    className={`suggestion-item ${index === selectedIndex ? 'selected' : ''}`}
                                    onClick={() => handleSuggestionClick(suggestion)}
                                >
                                    {suggestion.name}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="current-items">
                <h4>Your current {title.toLowerCase()}</h4>
                {nonEmptyItems.length === 0 && (
                    <h4>
                        No items yet!
                    </h4>
                )}
                <div className="item-list">
                    {nonEmptyItems.map((item, displayIndex) => {
                        const originalIndex = items.findIndex(originalItem => originalItem === item);
                        return (
                            <div key={displayIndex} className="item-tag-container">
                                <span className="item-tag">{item}</span>
                                <button
                                    type="button"
                                    onClick={() => onRemoveItem(category, originalIndex)}
                                    disabled={isLoading}
                                    className="item-remove-btn"
                                    title={`Remove ${item}`}
                                >
                                    <FontAwesomeIcon icon={faTimes} />
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default ItemListManager;