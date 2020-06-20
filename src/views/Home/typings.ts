export interface AdminLevel {
    key: number;
    adminLevel: number;
    title: string;
}

export interface SetAdminLevel {
    key: number;
    adminLevel: AdminLevel['adminLevel'],
    geojson: unknown;
}

export interface AdminSet {
    key: string;
    title: string;
    adminLevels: SetAdminLevel[];
}
