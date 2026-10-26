"use client";

import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function Contact() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [status, setStatus] = useState("idle"); // idle | submitting | success | error

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("submitting");
    const { error } = await supabase.from("inquiries").insert([form]);
    if (error) {
      setStatus("error");
    } else {
      setStatus("success");
      setForm({ name: "", email: "", phone: "", message: "" });
    }
  }

  return (
    <div className="px-6 pb-28 pt-36 md:px-12" id="top">
      <div className="mx-auto max-w-2xl">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-steel">
          Contact
        </p>
        <h1 className="mt-3 font-display text-4xl font-semibold text-ink md:text-5xl">
          Let's talk about your project
        </h1>

        {status === "success" ? (
          <p className="mt-10 font-mono text-sm text-steel">
            Message sent. We'll get back to you shortly.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-10 space-y-6">
            <Field
              label="Name"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
            />
            <Field
              label="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
            />
            <Field
              label="Phone"
              name="phone"
              value={form.phone}
              onChange={handleChange}
            />
            <div>
              <label className="font-mono text-xs uppercase tracking-widest text-ink/60">
                Message
              </label>
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                required
                rows={5}
                className="mt-2 w-full border border-ink/20 bg-transparent px-4 py-3 font-body text-ink outline-none focus:border-steel"
              />
            </div>
            <button
              type="submit"
              disabled={status === "submitting"}
              className="bg-ink px-8 py-3 font-mono text-xs uppercase tracking-widest text-paper transition-colors hover:bg-steel disabled:opacity-50"
            >
              {status === "submitting" ? "Sending…" : "Send message"}
            </button>
            {status === "error" && (
              <p className="font-mono text-xs text-red-600">
                Something went wrong. Please try again.
              </p>
            )}
          </form>
        )}
      </div>
    </div>
  );
}

function Field({ label, name, value, onChange, type = "text", required }) {
  return (
    <div>
      <label className="font-mono text-xs uppercase tracking-widest text-ink/60">
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="mt-2 w-full border border-ink/20 bg-transparent px-4 py-3 font-body text-ink outline-none focus:border-steel"
      />
    </div>
  );
}
