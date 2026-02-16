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
            // Si el usuario tiene sucursales embebidas, usarlas, sino buscar
            // Idealmente buscar detalles completos de las sucursales asignadas
            // Endpoint sugerido: GET /branches/my-branches
            const response = await api.get('/branches');
            if (response.data.success) {
                const branchesList = response.data.data;
                setBranches(branchesList);

                // Determinar sucursal activa
                const storedBranchId = localStorage.getItem('activeBranchId');
                const userActiveId = user.active_branch_id;

                let selected = branchesList.find(b => b.id === (userActiveId || storedBranchId));

                // Fallback: primera sucursal
                if (!selected && branchesList.length > 0) {
                    selected = branchesList[0];
                }

                if (selected) {
                    setActiveBranch(selected);
                    localStorage.setItem('activeBranchId', selected.id);
                    // Sincronizar con backend si es diferente
                    if (selected.id !== userActiveId) {
                        // Actualizar en background
                        apiUpdateActiveBranch(selected.id);
                    }
                }
            }
        } catch (error) {
            console.error('Error cargando sucursales:', error);
            // Fallback a info en token/user si falla API
            if (user.sucursales && user.sucursales.length > 0) {
                setBranches(user.sucursales);
                setActiveBranch(user.sucursales[0]);
            }
        } finally {
            setLoading(false);
        }
    };

    const changeBranch = async (branchId) => {
        const branch = branches.find(b => b.id === branchId);
        if (branch) {
            setActiveBranch(branch);
            localStorage.setItem('activeBranchId', branch.id);
            await apiUpdateActiveBranch(branch.id);
            // Recargar página o invalidar queries podría ser necesario
            // window.location.reload(); // Opcional, pero drástico
            return true;
        }
        return false;
    };

    const apiUpdateActiveBranch = async (branchId) => {
        try {
            await api.put('/auth/switch-branch', { branch_id: branchId });
            // updateUser({ active_branch_id: branchId }); // Actualizar contexto Auth si tiene update parcial
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
