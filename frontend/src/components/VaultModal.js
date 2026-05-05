// AI-assisted implementation:
// Copilot was used to help draft and structure modal/form logic + Bootstrap styling.
// Final behavior, naming, and validation were reviewed and adjusted by the author.

import React, { useEffect, useState } from "react";

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
                                <input
                                    type="password"
                                    className="form-control"
                                    value={form.password}
                                    onChange={updateField("password")}
                                    placeholder="Enter password"
                                />
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
