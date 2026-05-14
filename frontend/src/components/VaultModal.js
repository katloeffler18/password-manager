// AI-assisted implementation:
// Copilot was used to help draft and structure modal/form logic + Bootstrap styling.
// Final behavior, naming, and validation were reviewed and adjusted by the author.

import React, { useEffect, useState } from "react";
import { generatePassword } from "../utils/passwordGenerator";

const emptyForm = {
    title: "",
    service: "",
    username: "",
    password: "",
    notes: "",
};

export default function VaultModal({
    show,
    mode = "create",
    initialValue = null,
    onClose,
    onSave,
}) {
    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const [passwordOptions, setPasswordOptions] = useState({
        length: 16,
        includeLowercase: true,
        includeUppercase: true,
        includeNumbers: true,
        includeSymbols: true,
    });

    const [generatorError, setGeneratorError] = useState("");

    useEffect(() => {
        if (!show) return;

        setForm({
            title: initialValue?.title || "",
            service: initialValue?.service || "",
            username: initialValue?.username || "",
            password: initialValue?.password || "",
            notes: initialValue?.notes || "",
        });
    }, [show, initialValue]);

    if (!show) return null;

    const updateField = (field) => (event) => {
        setForm((current) => ({
            ...current,
            [field]: event.target.value,
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setSaving(true);
        try {
            await onSave({
                ...form,
                id: initialValue?.id,
            });
            onClose();
        } finally {
            setSaving(false);
        }
    };

    function handleGeneratePassword() {
        try {
            const generatedPassword = generatePassword(passwordOptions);

            setForm((prev) => ({
                ...prev,
                password: generatedPassword,
            }));

            setGeneratorError("");
        } catch (error) {
            setGeneratorError(error.message);
        }
    }

    return (
        <div className="modal d-block" tabIndex="-1" role="dialog" aria-modal="true">
            <div className="modal-dialog modal-dialog-centered modal-lg">
                <div className="modal-content border-0 shadow">
                    <form onSubmit={handleSubmit}>
                        <div className="modal-header">
                            <h5 className="modal-title">
                                {mode === "edit" ? "Edit password" : "Add password"}
                            </h5>
                            <button
                                type="button"
                                className="btn-close"
                                onClick={onClose}
                                aria-label="Close"
                            />
                        </div>

                        <div className="modal-body">
                            <div className="mb-3">
                                <label className="form-label">Title</label>
                                <input
                                    className="form-control"
                                    value={form.title}
                                    onChange={updateField("title")}
                                    placeholder="Gmail, GitHub, Bank..."
                                    required
                                />
                            </div>

                            <div className="row g-3">
                                <div className="col-md-6">
                                    <label className="form-label">Service</label>
                                    <input
                                        className="form-control"
                                        value={form.service}
                                        onChange={updateField("service")}
                                        placeholder="Service or website"
                                    />
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label">Username</label>
                                    <input
                                        className="form-control"
                                        value={form.username}
                                        onChange={updateField("username")}
                                        placeholder="username or email"
                                    />
                                </div>
                            </div>

                            <div className="mt-3">
                                <label className="form-label">Password</label>

                                <div className="input-group">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        className="form-control"
                                        value={form.password}
                                        onChange={updateField("password")}
                                        placeholder="Enter password"
                                    />

                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary"
                                        onClick={() => setShowPassword((prev) => !prev)}
                                        aria-label={showPassword ? "Hide password" : "Show password"}
                                    >
                                        <i
                                            className={`bi ${
                                                showPassword ? "bi-eye-slash" : "bi-eye"
                                            }`}
                                        />
                                    </button>
                                </div>

                                <button
                                    type="button"
                                    className="btn btn-outline-secondary btn-sm mt-2"
                                    onClick={handleGeneratePassword}
                                >
                                    Generate Password
                                </button>

                                {generatorError && (
                                    <div className="text-danger small mt-1">{generatorError}</div>
                                )}

                                <div className="card mt-3 p-3 bg-light">
                                    <div className="mb-3">
                                        <label className="form-label">
                                            Password Length: {passwordOptions.length}
                                        </label>

                                        <input
                                            type="range"
                                            min="8"
                                            max="32"
                                            value={passwordOptions.length}
                                            className="form-range"
                                            onChange={(event) =>
                                                setPasswordOptions((prev) => ({
                                                    ...prev,
                                                    length: Number(event.target.value),
                                                }))
                                            }
                                        />
                                    </div>

                                    <div className="form-check">
                                        <input
                                            type="checkbox"
                                            className="form-check-input"
                                            checked={passwordOptions.includeLowercase}
                                            onChange={(event) =>
                                                setPasswordOptions((prev) => ({
                                                    ...prev,
                                                    includeLowercase: event.target.checked,
                                                }))
                                            }
                                            id="lowercase"
                                        />
                                        <label className="form-check-label" htmlFor="lowercase">
                                            Lowercase
                                        </label>
                                    </div>

                                    <div className="form-check">
                                        <input
                                            type="checkbox"
                                            className="form-check-input"
                                            checked={passwordOptions.includeUppercase}
                                            onChange={(event) =>
                                                setPasswordOptions((prev) => ({
                                                    ...prev,
                                                    includeUppercase: event.target.checked,
                                                }))
                                            }
                                            id="uppercase"
                                        />
                                        <label className="form-check-label" htmlFor="uppercase">
                                            Uppercase
                                        </label>
                                    </div>

                                    <div className="form-check">
                                        <input
                                            type="checkbox"
                                            className="form-check-input"
                                            checked={passwordOptions.includeNumbers}
                                            onChange={(event) =>
                                                setPasswordOptions((prev) => ({
                                                    ...prev,
                                                    includeNumbers: event.target.checked,
                                                }))
                                            }
                                            id="numbers"
                                        />
                                        <label className="form-check-label" htmlFor="numbers">
                                            Numbers
                                        </label>
                                    </div>

                                    <div className="form-check">
                                        <input
                                            type="checkbox"
                                            className="form-check-input"
                                            checked={passwordOptions.includeSymbols}
                                            onChange={(event) =>
                                                setPasswordOptions((prev) => ({
                                                    ...prev,
                                                    includeSymbols: event.target.checked,
                                                }))
                                            }
                                            id="symbols"
                                        />
                                        <label className="form-check-label" htmlFor="symbols">
                                            Symbols
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-3">
                                <label className="form-label">Notes</label>
                                <textarea
                                    className="form-control"
                                    rows="4"
                                    value={form.notes}
                                    onChange={updateField("notes")}
                                    placeholder="Optional notes"
                                />
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button type="button" className="btn btn-outline-secondary" onClick={onClose}>
                                Cancel
                            </button>
                            <button type="submit" className="btn btn-primary" disabled={saving}>
                                {saving ? "Saving..." : "Save password"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}