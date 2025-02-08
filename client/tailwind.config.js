/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
        extend: {
            keyframes: {
                bomb: {
                    "0%, 100%": {transform: "translateY(0)"},
                    "25%": {transform: "translateY(-20px)"},
                    "50%": {transform: "translateY(10px)"},
                    "75%": {transform: "translateY(-10px)"},
                },
            },
            animation: {
                bomb: "bomb 0.5s ease-in-out",
            },
        },
    },
    plugins: [],
};
