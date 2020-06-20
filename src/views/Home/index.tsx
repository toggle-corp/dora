import React, { useState } from 'react';
import { _cs, isDefined, getDuplicates, isNotDefined, listToMap } from '@togglecorp/fujs';

import SegmentInput from '#components/SegmentInput';

import oldCountry from '#resources/admin0.json';
import oldDepartment from '#resources/admin1.json';
import oldMuni from '#resources/admin2.json';

import newCountry from '#resources/new-admin0.json';
import newDepartment from '#resources/new-admin1.json';
import newMuni from '#resources/new-admin2.json';

import AdminLevels from './AdminLevels';
import Sets from './Sets';
import {
    AdminLevel,
    AdminSet,
    GeoJson,
} from './typings';

import styles from './styles.css';

const adminLevels: AdminLevel[] = [
    {
        key: 'country',
        name: 'Country',
        level: 0,
    },
    {
        key: 'department',
        name: 'Department',
        level: 1,
    },
    {
        key: 'municipality',
        name: 'Municipality',
        level: 2,
    },
];

const sets: AdminSet[] = [
    {
        key: 'old-colombia',
        title: 'Old Colombia',
        settings: [
            {
                key: 1,
                adminLevel: 'country',
                geoJson: oldCountry as unknown as GeoJson,
                pointer: {
                    name: 'title',
                    code: 'code',
                    parentCode: undefined,
                    // parentName: undefined,
                },
            },
            {
                key: 2,
                adminLevel: 'department',
                geoJson: oldDepartment as unknown as GeoJson,
                pointer: {
                    name: 'title',
                    code: 'code',
                    parentCode: 'parent',
                    // parentName: undefined,
                },
            },
            {
                key: 3,
                adminLevel: 'municipality',
                geoJson: oldMuni as unknown as GeoJson,
                pointer: {
                    name: 'title',
                    code: 'code',
                    parentCode: 'parent',
                    // parentName: undefined,
                },
            },
        ],
    },
    {
        key: 'new-colombia',
        title: 'New Colombia',
        settings: [
            {
                key: 4,
                adminLevel: 'country',
                geoJson: newCountry as unknown as GeoJson,
                pointer: {
                    name: 'ADM0_ES',
                    code: 'ADM0_PCODE',
                    parentCode: undefined,
                    // parentName: undefined,
                },
            },
            {
                key: 5,
                adminLevel: 'department',
                geoJson: newDepartment as unknown as GeoJson,
                pointer: {
                    name: 'ADM1_ES',
                    code: 'ADM1_PCODE',
                    parentCode: 'ADM0_PCODE',
                    // parentName: undefined,
                },
            },
            {
                key: 6,
                adminLevel: 'municipality',
                geoJson: newMuni as unknown as GeoJson,
                pointer: {
                    name: 'ADM2_ES',
                    code: 'ADM2_PCODE',
                    parentCode: 'ADM1_PCODE',
                    // parentName: undefined,
                },
            },
        ],
    },
];

const optionKeySelector = (d: AdminLevel) => d.key;
const optionLabelSelector = (d: AdminLevel) => d.name;

interface Props {
    className?: string;
}

function Home(props: Props) {
    const { className } = props;

    const [currentAdminLevel, setCurrentAdminLevel] = useState(adminLevels[0].key);

    return (
        <div className={_cs(className, styles.home)}>
            <div className={styles.sidebar}>
                <AdminLevels adminLevels={adminLevels} />
                <Sets
                    adminLevels={adminLevels}
                    sets={sets}
                />
            </div>
            <div className={styles.mainContent}>
                <SegmentInput
                    className={styles.tabs}
                    options={adminLevels}
                    optionKeySelector={optionKeySelector}
                    optionLabelSelector={optionLabelSelector}
                    value={currentAdminLevel}
                    onChange={setCurrentAdminLevel}
                />
                <div className={styles.content}>
                    Main Content
                </div>
            </div>
        </div>
    );
}

export default Home;
