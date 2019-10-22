import React, {useState, useEffect} from 'react';
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Navbar from "react-bootstrap/Navbar";
import axios from 'axios';
import '../assets/styles/App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { ButtonProps } from 'react-bootstrap';

function App() {
    //Methods
    const handleClick = async () => {
        try {
        } catch (e) {
            setFaucetVariant('danger')
        }
    };
   

    //Components
    interface FaucetButton {className: string, variant: ButtonProps['variant']}
    const FaucetButton = (props: FaucetButton) => {
        return <Button variant={props.variant} onClick={() => handleClick()}>Get test RBTC</Button>
    }

    //Hooks
    const [faucetVariant, setFaucetVariant] = useState<any>('success');
    const [captcha, setCaptcha] = useState({"id": "", "png": ""});
    const [token, setToken] = useState('');
    
    useEffect(() => {
        const fetchCaptcha = async () => {
            const result = await axios.post(
                'http://localhost:8080/new/easy/10/100',
            );
        
            setCaptcha(result.data);
        };
        fetchCaptcha();
    }, []);

    return (
        <div className="background">
            <Navbar className="navbar-rsk">
                <Navbar.Brand>
                    <img className="logo"/>
                </Navbar.Brand>
            </Navbar>
            <body className="app-body">
                <Form >
                    <Form.Label >
                        Enter your testnet address or RNS name
                    </Form.Label>
                    <Form.Control type='input' placeholder='Address'/>
                    <br/>
                    <img className="captcha" src={`data:image/png;base64,${captcha.png}`} />
                    <br/>
                    <br/>
                    <Form.Control className="captcha-input" type='input' placeholder='Captcha'/>  
                    <br/>   
                    <FaucetButton className="faucet-button" variant={faucetVariant} />
                </Form>
            </body>
        </div>
    );
}

export default App;
