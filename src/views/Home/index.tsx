import React, { useState } from 'react';
import { _cs } from '@togglecorp/fujs';

import SegmentInput from '#components/SegmentInput';

import oldCountry from '#resources/geojsons/admin0.json';
import oldDepartment from '#resources/geojsons/admin1.json';
import oldMuni from '#resources/geojsons/admin2.json';
import newCountry from '#resources/geojsons/new-admin0.json';
import newDepartment from '#resources/geojsons/new-admin1.json';
import newMuni from '#resources/geojsons/new-admin2.json';

import AdminLevels from './AdminLevels';
import Sets from './Sets';

import { AdminLevel, AdminSet } from './typings';

import styles from './styles.css';

interface Props {
    className?: string;
}

const adminLevels: AdminLevel[] = [
    {
        key: 0,
        adminLevel: 0,
        title: 'Country',
    },
    {
        key: 1,
        adminLevel: 1,
        title: 'Departments',
    },
    {
        key: 2,
        adminLevel: 2,
        title: 'Municipalities',
    },
];

const sets: AdminSet[] = [
    {
        title: 'Old Colombia',
        adminLevels: [
            {
                key: 1,
                adminLevel: 0,
                geojson: oldCountry,
            },
            {
                key: 2,
                adminLevel: 1,
                geojson: oldDepartment,
            },
            {
                key: 3,
                adminLevel: 2,
                geojson: oldMuni,
            },
        ],
    },
    {
        title: 'New Colombia',
        adminLevels: [
            {
                key: 4,
                adminLevel: 0,
                geojson: newCountry,
            },
            {
                key: 5,
                adminLevel: 1,
                geojson: newDepartment,
            },
            {
                key: 6,
                adminLevel: 2,
                geojson: newMuni,
            },
        ],
    },
];

const optionKeySelector = (d: AdminLevel) => d.key;
const optionLabelSelector = (d: AdminLevel) => d.title;

const Home = (props: Props) => {
    const { className } = props;

    const [currentAdminLevel, setCurrentAdminLevel] = useState<AdminLevel['key']>(0);

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
};

export default Home;
