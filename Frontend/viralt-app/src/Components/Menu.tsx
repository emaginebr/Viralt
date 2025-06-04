import React, { useContext, useEffect, useState } from 'react';
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/esm/Button';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../Contexts/Auth/AuthContext';
import NavDropdown from 'react-bootstrap/NavDropdown';
import Alert from 'react-bootstrap/Alert';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWarning } from '@fortawesome/free-solid-svg-icons/faWarning'
import { faBitcoinSign, faBoltLightning, faBox, faBrazilianRealSign, faBuilding, faCancel, faCheck, faCheckCircle, faCircle, faCircleUser, faClose, faCog, faCoins, faDollar, faEthernet, faFileWord, faHome, faImage, faLock, faMap, faPencil, faPhoneAlt, faPhotoVideo, faSearch, faSignInAlt, faUser, faUserAlt, faUserCircle, faUserCog, faUserFriends, faUserGear, faUserGraduate, faUserGroup, faUserMd } from '@fortawesome/free-solid-svg-icons';
import MessageToast from './MessageToast';
import { MessageToastEnum } from '../DTO/Enum/MessageToastEnum';
import { UserRoleEnum } from '../DTO/Enum/UserRoleEnum';
import NetworkContext from '../Contexts/Network/NetworkContext';
import InvoiceContext from '../Contexts/Invoice/InvoiceContext';
import StatementSearchParam from '../DTO/Domain/StatementSearchParam';
import { ImageModal, ImageTypeEnum } from './ImageModal';
import { useTranslation } from 'react-i18next';
import { MenuLanguage } from './Functions';


export default function Menu() {

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
      <Navbar expand="lg" className="navmenu">
        <Container>
          <Link className='navbar-brand' to="/">{process.env.REACT_APP_PROJECT_NAME}</Link>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto"> {/* Apply t() to link texts */}
              <Link className='nav-link' to="/"><FontAwesomeIcon icon={faHome} fixedWidth /> Home</Link>
              <Link className='nav-link' to="/campaigns"><FontAwesomeIcon icon={faMap} fixedWidth /> My Campaigns</Link>
            </Nav>
          </Navbar.Collapse>
          <Navbar.Collapse>

            <Nav className="ms-auto justify-content-end">
              <MenuLanguage />
              {
                authContext.sessionInfo ?
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
                  :
                  <>
                    <Nav.Item>
                      <Button variant="danger" onClick={async () => {
                        navigate("/account/login");
                      }}> {/* Use t() for button text */}
                        <FontAwesomeIcon icon={faSignInAlt} fixedWidth /> {t('sign_in')}
                      </Button>
                    </Nav.Item>
                  </>
              }
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      {/*showAlert &&
        <Container>
          <Alert key="danger" variant="danger" onClose={() => setShowAlert(false)} dismissible>
            <FontAwesomeIcon icon={faWarning} /> {t('trial_version_warning')}
          </Alert>
        </Container>
      */}
    </>
  );
}
