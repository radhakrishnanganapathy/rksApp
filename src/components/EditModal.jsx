import React, { useState, useEffect } from 'react';

const EditModal = ({ isOpen, onClose, onSave, title, initialData, fields }) => {
    const [formData, setFormData] = useState(initialData || {});

    useEffect(() => {
        setFormData(initialData || {});
    }, [initialData]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
        onClose();
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
            <div style={{
                backgroundColor: 'white', padding: '20px', borderRadius: '8px', width: '90%', maxWidth: '500px',
                maxHeight: '90vh', overflowY: 'auto'
            }}>
                <h3>{title}</h3>
                <form onSubmit={handleSubmit}>
                    {fields.map(field => (
                        <div key={field.name} style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', marginBottom: '5px' }}>{field.label}</label>
                            {field.type === 'select' ? (
                                <select
                                    name={field.name}
                                    value={formData[field.name] || ''}
                                    onChange={handleChange}
                                    style={{ width: '100%', padding: '8px' }}
                                    required={field.required}
                                >
                                    <option value="">Select {field.label}</option>
                                    {field.options.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            ) : (
                                <input
                                    type={field.type || 'text'}
                                    name={field.name}
                                    value={formData[field.name] || ''}
                                    onChange={handleChange}
                                    style={{ width: '100%', padding: '8px' }}
                                    required={field.required}
                                    step={field.step}
                                />
                            )}
                        </div>
                    ))}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                        <button type="button" onClick={onClose} style={{ padding: '8px 16px', backgroundColor: '#ccc', border: 'none', borderRadius: '4px' }}>Cancel</button>
                        <button type="submit" style={{ padding: '8px 16px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}>Save</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditModal;
