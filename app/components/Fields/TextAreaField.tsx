
type FormField = {
    label: string;
    value: string;
    isRequired: boolean;
    placeholder: string;
    onChange: (value: string) => void;
};

export const TextAreaField = ({ label, value, onChange, placeholder, isRequired }: FormField) => (
    <div className="space-y-1">
        <label className="block text-medium text-[#003C71] font-medium">
            {label} {isRequired && <span className="text-red-500">*</span>}
        </label>
        <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full p-2 border rounded-lg focus:ring-[#003C71] outline-none resize-none"
            placeholder={placeholder}
            required={isRequired}
            rows={3}
            style={{ resize: 'none' }}
        />
    </div>
);