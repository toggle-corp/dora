export type Code = string | number;

// We should use one from mapbox
export interface GeoJson {
    type: string;
    crs?: unknown;
    features: {
        type: string;
        properties: Record<string, unknown>;
        geometry: unknown;
    }[];
}

export interface AdminLevel {
    key: string;
    level: number;
    name: string;
}

export interface Settings {
    key: number;
    geoJson: GeoJson;
    adminLevel: string;

    pointer: {
        code: Code | undefined;
        parentCode: string | undefined;
        name: Code | undefined;
        // parentName: string | undefined;
    };
}

export interface AdminSet {
    key: string;
    title: string;
    settings: Settings[];
}
