import { useEffect, useRef, useState } from "react";
import './SearchableDropdown.css'

const SearchableDropdown = ({
    options,
    label,
    uniqueIdKey,
    id,
    selectedVal,
    handleChange,
    handleQueryChange
}: {
    options: any[],
    label: string,
    uniqueIdKey: string,
    id: string | number,
    selectedVal?: string | number | null,
    handleChange: Function,
    handleQueryChange: Function
}) => {
    const [query, setQuery] = useState("");
    const [isOpen, setIsOpen] = useState(false);

    const inputRef = useRef(null);

    useEffect(() => {
        document.addEventListener("click", toggle);
        return () => document.removeEventListener("click", toggle);
    }, []);

    const selectOption = (option: any) => {
        setQuery(() => "");
        handleQueryChange('');
        handleChange(option[uniqueIdKey]);
        setIsOpen((isOpen) => !isOpen);
    };

    function toggle(e: any) {
        setIsOpen(e && e.target === inputRef.current);
    }

    const getDisplayValue = () => {
        if (query) return query;
        const obj = options.find(x => x[uniqueIdKey] === selectedVal);
        if (selectedVal && obj) return obj[label] || '';

        return "";
    };

    const filter = (options: any) => {
        return options.filter(
            (option: any) => option[label].toLowerCase().indexOf(query.toLowerCase()) > -1
        );
    };

    return (
        <div className="dropdown">
            <div className="control">
                <div className="selected-value">
                    <input className="form-control"
                        ref={inputRef}
                        type="text"
                        value={getDisplayValue()}
                        name="searchTerm"
                        onChange={(e) => {
                            setQuery(e.target.value);
                            handleQueryChange(e.target.value);
                            handleChange(null);
                        }}
                        onClick={toggle}
                        placeholder={'Write 3 char to search'}
                    />
                </div>
                <div className={`arrow ${isOpen ? "open" : ""}`}></div>
            </div>

            <div className={`options ${isOpen ? "open" : ""}`}>
                {filter(options).map((option: any, index: number) => {
                    return (
                        <div
                            onClick={() => selectOption(option)}
                            className={`option ${option[label] === selectedVal ? "selected" : ""
                                }`}
                            key={`${id}-${index}`}
                        >
                            {option[label]}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default SearchableDropdown;
