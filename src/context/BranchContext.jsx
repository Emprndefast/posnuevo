import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContextMongo';
import api from '../api/api';

const BranchContext = createContext();

export const useBranch = () => {
    const context = useContext(BranchContext);
    if (!context) {
        throw new Error('useBranch debe ser usado dentro de un BranchProvider');
    }
    return context;
};

export const BranchProvider = ({ children }) => {
    const { user, updateUser } = useAuth();
    const [branches, setBranches] = useState([]);
    const [activeBranch, setActiveBranch] = useState(null);
    const [loading, setLoading] = useState(true);

    // Cargar sucursales cuando el usuario cambia
    useEffect(() => {
        if (user) {
            fetchBranches();
        } else {
            setBranches([]);
            setActiveBranch(null);
            setLoading(false);
        }
    }, [user]);

    const fetchBranches = async () => {
        try {
            const response = await api.get('/branches');
            if (response.data.success) {
                const branchesList = response.data.data;
                setBranches(branchesList);

                // Determinar sucursal activa
                const storedBranchId = localStorage.getItem('activeBranchId');
                const userActiveId = user.active_branch_id;

                // Buscar usando _id o id (MongoDB usa _id)
                let selected = branchesList.find(b => {
                    const branchId = b._id || b.id;
                    return branchId === userActiveId || branchId === storedBranchId;
                });

                // Fallback: primera sucursal
                if (!selected && branchesList.length > 0) {
                    selected = branchesList[0];
                }

                if (selected) {
                    const branchId = selected._id || selected.id;
                    setActiveBranch(selected);
                    localStorage.setItem('activeBranchId', branchId);
                    // Sincronizar con backend si es diferente
                    if (branchId !== userActiveId) {
                        // Actualizar en background
                        apiUpdateActiveBranch(branchId);
                    }
                } else if (branchesList.length === 0) {
                    console.warn('No hay sucursales disponibles. Por favor crea una sucursal primero.');
                }
            }
        } catch (error) {
            console.error('Error cargando sucursales:', error);
            // Fallback a info en token/user si falla API
            if (user.sucursales && user.sucursales.length > 0) {
                setBranches(user.sucursales);
                const firstBranch = user.sucursales[0];
                setActiveBranch(firstBranch);
                const branchId = firstBranch._id || firstBranch.id || firstBranch.branch_id;
                if (branchId) {
                    localStorage.setItem('activeBranchId', branchId);
                }
            }
        } finally {
            setLoading(false);
        }
    };

    const changeBranch = async (branchId) => {
        const branch = branches.find(b => (b._id || b.id) === branchId);
        if (branch) {
            const id = branch._id || branch.id;
            setActiveBranch(branch);
            localStorage.setItem('activeBranchId', id);
            await apiUpdateActiveBranch(id);
            // Recargar página o invalidar queries podría ser necesario
            // window.location.reload(); // Opcional, pero drástico
            return true;
        }
        return false;
    };

    const apiUpdateActiveBranch = async (branchId) => {
        try {
            const response = await api.put('/auth/switch-branch', { branch_id: branchId });
            // Si el backend devuelve un nuevo token, actualizarlo
            if (response.data.success && response.data.token) {
                localStorage.setItem('token', response.data.token);
            }
        } catch (error) {
            console.error('Error sincronizando sucursal activa:', error);
        }
    };

    const value = {
        branches,
        activeBranch,
        changeBranch,
        loading
    };

    return (
        <BranchContext.Provider value={value}>
            {children}
        </BranchContext.Provider>
    );
};

export default BranchContext;
