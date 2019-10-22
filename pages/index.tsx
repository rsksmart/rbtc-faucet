import React, {useState, useEffect} from 'react';
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Navbar from "react-bootstrap/Navbar";
import axios from 'axios';
import '../assets/styles/App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { ButtonProps, Row, Container, Col } from 'react-bootstrap';
import config from '../config.json';

function App() {
    //Methods
    const handleClick = async () => {
        try {
        } catch (e) {
            setFaucetVariant('danger')
        }
    };
   

    //Components
    interface FaucetButton {variant: ButtonProps['variant']}
    const FaucetButton = (props: FaucetButton) => {
        return <Button variant={props.variant} onClick={() => handleClick()}>Get test RBTC</Button>
    }

    //Hooks
    const [faucetVariant, setFaucetVariant] = useState<any>('success');
    const [captcha, setCaptcha] = useState({"id": "", "png": ""});
    const [token, setToken] = useState('');
    
    useEffect(() => {
        const fetchCaptcha = async () => {
            const result = await axios.post(config.NEW_CAPTCHA_URL);
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
                <Container className="faucet-container">
                    <Row>
                        <Col className="col-centerer">
                            <Form.Label >
                                Enter your testnet address or RNS name
                            </Form.Label>
                        </Col>
                    </Row>
                    <Row>
                        <Col className="col-centered">
                            <Form.Control type='input' placeholder='Address'/>
                        </Col>
                    </Row>
                    <br/>
                    <Row>
                        <Col className="col-centered">
                            <img className="captcha-image" src={`data:image/png;base64,${captcha.png}`} />
                        </Col>
                    </Row>
                    <br/>
                    <br/>
                    <Row>
                        <Col className="col-centered">
                            <Form.Control className="faucet-input" type='input' placeholder='Captcha'/>  
                        </Col>
                    </Row>
                    <br/>
                    <Row>
                        <Col className="col-centered">
                            <FaucetButton variant={faucetVariant} />    
                        </Col>
                    </Row>   
                </Container>
            </body>
        </div>
    );
}

export default App;
