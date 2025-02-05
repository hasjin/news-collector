// components/SearchForm.tsx
"use client";

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

interface SearchFormProps {
    initialOutlet: string;
    initialDate: string;
    initialSearch: string;
    outlets: string[];
}

export default function SearchForm({
                                       initialOutlet,
                                       initialDate,
                                       initialSearch,
                                       outlets,
                                   }: SearchFormProps) {
    const router = useRouter();
    const [outlet, setOutlet] = useState(initialOutlet);
    const [date, setDate] = useState(initialDate);
    const [searchText, setSearchText] = useState(initialSearch);

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const params = new URLSearchParams({ outlet, date, search: searchText });
        router.push(`/?${params.toString()}`);
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="flex flex-col md:flex-row items-center justify-center mb-8 space-y-4 md:space-y-0 md:space-x-4"
        >
            <div>
                <label className="font-medium mr-2">언론사:</label>
                <select
                    value={outlet}
                    onChange={(e) => setOutlet(e.target.value)}
                    className="p-2 border border-gray-300 rounded"
                >
                    <option value="">전체</option>
                    {outlets.map((item) => (
                        <option key={item} value={item}>
                            {item}
                        </option>
                    ))}
                </select>
            </div>
            <div>
                <label className="font-medium mr-2">날짜:</label>
                <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="p-2 border border-gray-300 rounded"
                />
            </div>
            <div>
                <label className="font-medium mr-2">검색:</label>
                <input
                    type="text"
                    placeholder="제목 또는 내용"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    className="p-2 border border-gray-300 rounded"
                />
            </div>
            <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
            >
                검색
            </button>
        </form>
    );
}