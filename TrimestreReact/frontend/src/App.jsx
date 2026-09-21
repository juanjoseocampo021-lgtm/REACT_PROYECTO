import { Routes, Route, Navigate } from 'react-router-dom'
import { Header } from './components/Header'
import { Footer } from './components/Footer'
import { WhatsAppButton } from './components/WhatsAppButton'
import { ChatbotWidget } from './components/ChatbotWidget'
import { RutaProtegida } from './components/RutaProtegida'
import { Index } from './pages/Index'
import { Quienes } from './pages/Quienes'
import { Contacto } from './pages/Contacto'
import { Login } from './pages/Login'
import { RecoverPassword } from './pages/RecoverPassword'
import { Servicios } from './pages/Servicios'
import { Destino } from './pages/Destino'
import { Destinos } from './pages/Destinos'
import { NotFound } from './pages/NotFound'
import { Dashboard } from './pages/Dashboard'
import './App.css'

const PublicLayout = ({ children }) => <div className="app-layout"><Header/><div className="contenido">{children}</div><Footer/><WhatsAppButton/><ChatbotWidget/></div>
const DashboardRoute = ({ roles }) => <RutaProtegida rolesPermitidos={roles}><Dashboard/></RutaProtegida>
export default function App(){return <Routes><Route path="/" element={<PublicLayout><Index/></PublicLayout>}/><Route path="/quienes" element={<PublicLayout><Quienes/></PublicLayout>}/><Route path="/contacto" element={<PublicLayout><Contacto/></PublicLayout>}/><Route path="/login" element={<PublicLayout><Login/></PublicLayout>}/><Route path="/recuperar" element={<PublicLayout><RecoverPassword/></PublicLayout>}/><Route path="/servicios" element={<PublicLayout><Servicios/></PublicLayout>}/><Route path="/destinos" element={<PublicLayout><Destinos/></PublicLayout>}/><Route path="/destino/:id" element={<PublicLayout><Destino/></PublicLayout>}/><Route path="/panel-admin" element={<DashboardRoute roles={['administrador']}/>}/><Route path="/panel-empleado" element={<DashboardRoute roles={['administrador','empleado']}/>}/><Route path="/panel-cliente" element={<DashboardRoute roles={['administrador','empleado','cliente']}/>}/><Route path="/404" element={<PublicLayout><NotFound/></PublicLayout>}/><Route path="*" element={<Navigate to="/404" replace/>}/></Routes>}
