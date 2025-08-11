import { Chat } from "./side/Chat"
import { Side } from "./side/Side"
import { Welcome } from "./welcome/Welcome"

export const Layout = () => {

    return (
        <>
            <Welcome />
            <Side />
        </>
    )
}