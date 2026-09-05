import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { loginUser } from "../../api/auth.api";

import { useAuth } from "../../context/AuthContext";

import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Card from "../../components/ui/Card";

export default function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [form, setForm] = useState({
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
            const response = await loginUser(form);

            // Store token & user into AuthContext
            login(response.token, response.user, "EMPLOYEE");

            navigate("/dashboard");
        } catch (error) {
            setError(
                error.response?.data?.message ||
                error.response?.data?.error ||
                "Invalid email or password."
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

                {/* Brand */}

                <div className="mb-8 text-center">

                    <div className="
                        mx-auto
                        mb-4
                        flex
                        h-12
                        w-12
                        items-center
                        justify-center
                        rounded-xl
                        bg-primary-700
                        text-xl
                        font-bold
                        text-white
                    ">
                        D
                    </div>

                    <h1 className="
                        text-2xl
                        font-bold
                        tracking-tight
                        text-text-primary
                    ">
                        DealFlow360
                    </h1>

                    <p className="
                        mt-2
                        text-sm
                        text-text-secondary
                    ">
                        Sales operations made simple
                    </p>

                </div>

                {/* Card */}

                <Card>

                    <div className="mb-6">

                        <h2 className="
                            text-xl
                            font-semibold
                            text-text-primary
                        ">
                            Welcome back
                        </h2>

                        <p className="
                            mt-1
                            text-sm
                            text-text-secondary
                        ">
                            Sign in to your Sales Representative account
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
                            Sign in
                        </Button>

                    </form>

                    {/* Register */}

                    <p className="
                        mt-6
                        text-center
                        text-sm
                        text-text-secondary
                    ">
                        Don't have an account?{" "}

                        <Link
                            to="/register"
                            className="
                                font-semibold
                                text-primary-700
                                hover:text-primary-800
                            "
                        >
                            Create account
                        </Link>
                    </p>

                </Card>

            </div>

        </div>
    );
}