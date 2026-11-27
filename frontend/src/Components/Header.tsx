import { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import AuthContext from "../Contexts/Auth/AuthContext";
import NetworkContext from "../Contexts/Network/NetworkContext";
import MessageToast from "./MessageToast";
import { MessageToastEnum } from "../DTO/Enum/MessageToastEnum";
import { ImageModal, ImageTypeEnum } from "./ImageModal";
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/esm/Button';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleUser, faClose, faHome, faImage, faLock, faMap, faPencil, faPlus, faSignInAlt } from "@fortawesome/free-solid-svg-icons";
import { MenuLanguage } from "./Functions";

export default function Header() {

    const [showAlert, setShowAlert] = useState<boolean>(true);
    const [showImageModal, setShowImageModal] = useState<boolean>(false);

    const [showMessage, setShowMessage] = useState<boolean>(false);
    const [messageText, setMessageText] = useState<string>("");

    const { t } = useTranslation();

    const throwError = (message: string) => {
        setMessageText(message);
        setShowMessage(true);
    };

    let navigate = useNavigate();

    const authContext = useContext(AuthContext);
    const networkContext = useContext(NetworkContext);

    useEffect(() => {
        /*
        authContext.loadUserSession().then((authRet) => {
          if (authRet.sucesso) {
            networkContext.listByUser().then((ret) => {
              if (!ret.sucesso) {
                throwError(ret.mensagemErro);
              }
            });
          }
        });
        */
    }, []);

    return (
        <>
            <MessageToast
                dialog={MessageToastEnum.Error}
                showMessage={showMessage}
                messageText={messageText}
                onClose={() => setShowMessage(false)}
            ></MessageToast>
            <ImageModal
                Image={ImageTypeEnum.User}
                show={showImageModal}
                onClose={() => setShowImageModal(false)}
            />
            <header id="header" className="header d-flex align-items-center fixed-top">
                <div className="header-container container-fluid container-xl position-relative d-flex align-items-center justify-content-between">

                    <Link to="/" className="logo d-flex align-items-center me-auto me-xl-0">
                        <h1 className="sitename">{process.env.REACT_APP_PROJECT_NAME}</h1>
                    </Link>

                    <Navbar className="navmenu">
                        <Container>
                            <Navbar.Toggle aria-controls="basic-navbar-nav" />
                            <Navbar.Collapse id="basic-navbar-nav">
                                <Nav className="me-auto">
                                    <Link className='active' to="/">Home</Link>
                                    <Link to="/campaigns">My Campaigns</Link>
                                    <Link to="/campaigns"><FontAwesomeIcon icon={faPlus} fixedWidth /> New Campaign</Link>
                                </Nav>
                            </Navbar.Collapse>
                            <Navbar.Collapse>

                                <Nav className="ms-auto justify-content-end">
                                    <MenuLanguage />
                                    {
                                        authContext.sessionInfo &&
                                            <NavDropdown title={
                                                <>
                                                    <FontAwesomeIcon icon={faCircleUser} />&nbsp;
                                                    <span>{authContext.sessionInfo.name}</span>
                                                </>
                                            } id="basic-nav-dropdown">
                                                <NavDropdown.Item onClick={() => setShowImageModal(true)}>
                                                    <FontAwesomeIcon icon={faImage} fixedWidth /> {t('change_picture')}
                                                </NavDropdown.Item>
                                                <NavDropdown.Item onClick={async () => {
                                                    navigate("/account/edit-account");
                                                }}><FontAwesomeIcon icon={faPencil} fixedWidth /> {t('edit_account')}</NavDropdown.Item>
                                                <NavDropdown.Item onClick={async () => {
                                                    navigate("/account/change-password");
                                                }}><FontAwesomeIcon icon={faLock} fixedWidth /> {t('change_password')}</NavDropdown.Item>
                                                <NavDropdown.Divider />
                                                <NavDropdown.Item onClick={async () => {
                                                    let ret = authContext.logout();
                                                    if (!ret.sucesso) {
                                                        throwError(ret.mensagemErro);
                                                    }
                                                    navigate(0);
                                                }}><FontAwesomeIcon icon={faClose} fixedWidth /> {t('logout')}</NavDropdown.Item>
                                            </NavDropdown>
                                    }
                                </Nav>
                            </Navbar.Collapse>
                        </Container>
                    </Navbar>
                    {!authContext.sessionInfo &&
                        <a
                            className="btn-getstarted"
                            href="#"
                            onClick={async () => {
                                navigate("/account/login");
                            }}
                        >
                            <FontAwesomeIcon icon={faSignInAlt} fixedWidth /> Sign In
                        </a>
                    }

                </div>
            </header>
        </>
    );
}