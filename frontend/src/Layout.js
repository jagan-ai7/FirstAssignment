import { Chat } from "./side/Chat"
import { Side } from "./side/Side"
import { Welcome } from "./welcome/Welcome"

export const Layout = () => {
    
    return (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
            <Welcome />
            <div style={{ display: 'flex', flexDirection: 'row', gap: '5px' }}>
                <Side />
                <Chat />
            </div>
        </div>
    )
}