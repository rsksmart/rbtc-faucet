import React, {useState, useEffect} from 'react';
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Navbar from "react-bootstrap/Navbar";
import axios from 'axios';
import RskUtil from "../utils/rsk-util";
import '../assets/styles/App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const rskUtil = new RskUtil();

function App() {
    //Methods
    const handleClick = async () => {
        try {
            await rskUtil.sendRbtc()
        } catch (e) {
            setFaucetVariant('danger')
        }
    };
   

    //Components
    const FaucetButton = props => {
        return <Button variant={props.variant} onClick={() => handleClick()}>Get test RBTC</Button>
    }

    //Hooks
    const [faucetVariant, setFaucetVariant] = useState('success');
    const [captcha, setCaptcha] = useState({});
    
    useEffect(() => {
        const fetchCaptcha = async () => {
            const result = await axios.post(
                'http://localhost:8080/new/easy/10/100',
            );
        
            console.log(result.data);

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
                    {
                        captcha == '' ? <></> : <img src={`data:image/png;base64,${captcha.png}`} style={{borderRadius: '100px'}} />
                    }
                    <br/>
                    <br/>
                    <Form.Control type='input' placeholder='Captcha'/>  
                    <br/>   
                    <FaucetButton variant={faucetVariant} style={{borderRadius: '70px'}} />
                </Form>
            </body>
        </div>
    );
}

export default App;
