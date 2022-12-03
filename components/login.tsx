// components/login.tsx

import { useState } from "react"
import Cookies from "universal-cookie"

// super simple login component
export default function Login({ redirectPath }: { redirectPath: string }) {
    const [password, setPassword] = useState("")
    return (
        <div className="max-w-md w-96 p-6 m-6 rounded-md sm:p-10 dark:bg-gray-900 dark:text-gray-100">
            <div className="mb-8 text-center">
                <h1 className="my-3 text-4xl font-bold">Sign in</h1>
            </div>
            <form action="" className
                ="space-y-12 ng-untouched ng-pristine ng-valid">
                <div className="space-y-4">
                    <div>
                        <div className="flex justify-between mb-2">
                            <label htmlFor="password" className="text-sm">Password</label>
                        </div>
                        <input
                            type="password"
                            className="w-full px-3 py-2 border rounded-md dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100" placeholder="********"
                            value={password}
                            name="password"
                            id="password"
                            onChange={(e) => setPassword(e.target.value)}
                        ></input>

                    </div>
                </div>
                <div className="space-y-2">
                    <div>
                        <button
                            type="submit"
                            className="w-full px-8 py-3 font-semibold rounded-md dark:bg-violet-400 dark:text-gray-900"
                            onClick={(e) => {
                                e.preventDefault()
                                const cookies = new Cookies()
                                cookies.set("hasReadPermission", password, {
                                    path: "/",
                                })
                                window.location.href = redirectPath ?? "/"
                            }}
                        >Sign In</button>

                    </div>
                </div>
            </form>
        </div>
    );
}