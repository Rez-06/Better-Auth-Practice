"use client";
import { useState } from "react";
import { signUp } from "@/lib/auth-client";
import {Check, Eye, EyeSlash} from "@gravity-ui/icons";
import {Button, Description, FieldError, Form, Input, Label, TextField} from "@heroui/react";

const SignUpPage = () => {
    const [showPassword, setShowPassword] = useState(false);

    const onSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data = {};
        // Convert FormData to plain object
        formData.forEach((value, key) => {
        data[key] = value.toString();
        });
        
        const {data: resData, error} = await signUp.email({
            name: data.name,
            email: data.email,
            password: data.password
        })
        console.log(resData,error)
    };
    return (
        <Form className="flex w-96 flex-col gap-4" onSubmit={onSubmit}>
            <TextField
                isRequired
                name="name"
                validate={(value) => {
                if (value.length < 3) {
                    return "Name must be at least 3 characters";
                }
                return null;
                }}
            >
                <Label>Name</Label>
                <Input placeholder="John Doe" />
                <FieldError />
            </TextField>
            <TextField
                isRequired
                name="email"
                type="email"
                validate={(value) => {
                if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value)) {
                    return "Please enter a valid email address";
                }
                return null;
                }}
            >
                <Label>Email</Label>
                <Input placeholder="john@example.com" />
                <FieldError />
            </TextField>
            <TextField
                isRequired
                minLength={8}
                name="password"
                type={showPassword ? "text" : "password"}
                validate={(value) => {
                if (value.length < 8) {
                    return "Password must be at least 8 characters";
                }
                if (!/[A-Z]/.test(value)) {
                    return "Password must contain at least one uppercase letter";
                }
                if (!/[0-9]/.test(value)) {
                    return "Password must contain at least one number";
                }
                return null;
                }}
            >
                <Label>Password</Label>
                <div className="relative">
                    <Input
                        className="w-full pr-10"
                        placeholder="Enter your password"
                    />
                    <Button
                        type="button"
                        isIconOnly
                        size="sm"
                        variant="ghost"
                        className="absolute right-1 top-1/2 -translate-y-1/2"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        onPress={() => setShowPassword((prev) => !prev)}
                    >
                        {showPassword ? <EyeSlash /> : <Eye />}
                    </Button>
                </div>
                <Description>Must be at least 8 characters with 1 uppercase and 1 number</Description>
                <FieldError />
            </TextField>
            <div className="flex gap-2">
                <Button type="submit">
                <Check />
                Submit
                </Button>
                <Button type="reset" variant="secondary">
                Reset
                </Button>
            </div>
        </Form>
        
    );
};

export default SignUpPage;