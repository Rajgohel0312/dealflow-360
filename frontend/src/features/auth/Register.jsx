import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { registerUser } from "../../api/auth.api";

import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Card from "../../components/ui/Card";

import Logo from "../../components/ui/Logo";

export default function Register() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (event) => {
        setForm({
            ...form,
            [event.target.name]: event.target.value,
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");
        setLoading(true);

        try {
            await registerUser(form);

            navigate("/login");
        } catch (error) {
            setError(
                error.response?.data?.error ||
                    "Unable to create account."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="
            flex
            min-h-screen
            items-center
            justify-center
            bg-background
            px-4
            py-12
        ">
            <div className="w-full max-w-md">

                {/* Brand Header */}
                <div className="mb-6 text-center flex flex-col items-center">
                    <Logo size="lg" subtitle="B2B Deal & Revenue Execution Platform" className="justify-center" />
                </div>

                {/* Card */}
                <Card>

                    <div className="mb-6">

                        <h2 className="
                            text-xl
                            font-semibold
                            text-text-primary
                        ">
                            Create your account
                        </h2>

                        <p className="
                            mt-1
                            text-sm
                            text-text-secondary
                        ">
                            Register as a Sales Representative
                        </p>

                    </div>

                    {/* Error */}
                    {error && (
                        <div className="
                            mb-5
                            rounded-lg
                            border
                            border-danger-200
                            bg-danger-50
                            px-4
                            py-3
                            text-sm
                            text-danger-700
                        ">
                            {error}
                        </div>
                    )}

                    {/* Form */}
                    <form
                        onSubmit={handleSubmit}
                        className="space-y-5"
                    >

                        <Input
                            label="Full name"
                            name="name"
                            type="text"
                            placeholder="John Doe"
                            value={form.name}
                            onChange={handleChange}
                            required
                        />

                        <Input
                            label="Email address"
                            name="email"
                            type="email"
                            placeholder="john@example.com"
                            value={form.email}
                            onChange={handleChange}
                            required
                        />

                        <Input
                            label="Password"
                            name="password"
                            type="password"
                            placeholder="••••••••"
                            value={form.password}
                            onChange={handleChange}
                            required
                        />

                        <Button
                            type="submit"
                            loading={loading}
                        >
                            Create account
                        </Button>

                    </form>

                    {/* Login */}
                    <p className="
                        mt-6
                        text-center
                        text-sm
                        text-text-secondary
                    ">
                        Already have an account?{" "}

                        <Link
                            to="/login"
                            className="
                                font-semibold
                                text-primary-700
                                hover:text-primary-800
                            "
                        >
                            Sign in
                        </Link>
                    </p>

                </Card>

            </div>
        </div>
    );
}