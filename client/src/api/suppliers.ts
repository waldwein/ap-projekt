import { API_BASE_URL } from "./api";

export interface Supplier {
    _id: string;
    title: string;
    contactMail: string;
    phone?: string;
    createdAt: string;
    isActive?: boolean;
}

export async function fetchSuppliers(): Promise<Supplier[]> {
    const res = await fetch(`${API_BASE_URL}/suppliers`);
    if (!res.ok) throw new Error(`Failed to fetch suppliers: ${res.status}`);
    return res.json();
}
