export async function registerUser(email: string, username: string, password: string){
    const response = await fetch (`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ email, username, password })
    })

    const data = await response.json();

    if(!response.ok){
        throw new Error (data.message || 'Registration failed')
    };

    return data
};

export async function loginUser(email: string, password: string){
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        credentials: "include",
        body: JSON.stringify({ email, password })
    })

    const data = await response.json();

    if(!response.ok){
        throw new Error (data.message || 'Login failed')
    };

    return data
}