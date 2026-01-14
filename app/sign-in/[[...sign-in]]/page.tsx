import { SignIn } from '@clerk/nextjs'

export default function Page() {
    return <main className="flex items-center justify-center">
        <SignIn
            routing="path"
            path="/sign-in"
            forceRedirectUrl="/"
        />
    </main>
}