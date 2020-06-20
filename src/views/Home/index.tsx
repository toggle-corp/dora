import React, { useState, useCallback } from 'react';
import { _cs, isDefined, isNotDefined } from '@togglecorp/fujs';

import Button from '#components/Button';
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
import {
    getProperty,
    generateMapping,
    Link,
} from './utils';

import styles from './styles.css';

interface LinkListingProps {
    currentAdminLevel: string;
    data: { [key: string]: Link[] } | undefined;
    firstSet: AdminSet;
    secondSet: AdminSet;
}
function LinkListing(props: LinkListingProps) {
    const {
        currentAdminLevel,
        data,
        firstSet,
        secondSet,
    } = props;

    if (!data) {
        return null;
    }

    const unitMapping = data[currentAdminLevel];
    const firstSettings = firstSet.settings.find((item) => item.adminLevel === currentAdminLevel);
    const secondSettings = secondSet.settings.find((item) => item.adminLevel === currentAdminLevel);
    // This is an error case
    if (!unitMapping || !firstSettings || !secondSettings) {
        return null;
    }

    const deleted = unitMapping
        .filter((item) => isDefined(item.from) && isNotDefined(item.to))
        .map((item) => {
            const property = getProperty(
                firstSettings.pointer,
                firstSettings.geoJson.features[item.from],
            );
            return {
                from: item.from,
                name: property.name,
                code: property.code,
            };
        });

    const added = unitMapping
        .filter((item) => isNotDefined(item.from) && isDefined(item.to))
        .map((item) => {
            const property = getProperty(
                secondSettings.pointer,
                secondSettings.geoJson.features[item.to],
            );
            return {
                to: item.to,
                name: property.name,
                code: property.code,
            };
        });

    return (
        <div className={styles.links}>
            {added.length > 0 && (
                <>
                    <h2>Addition </h2>
                    <div>
                        {added.map((item) => (
                            <div key={item.to}>
                                {`${item.name} (${item.code})`}
                            </div>
                        ))}
                    </div>
                </>
            )}
            {deleted.length > 0 && (
                <>
                    <h2>Deletion</h2>
                    <div>
                        {deleted.map((item) => (
                            <div key={item.from}>
                                {`${item.name} (${item.code})`}
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

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
    const [mapping, setMapping] = useState<{ [key: string]: Link[] } | undefined>(undefined);

    const firstSet = sets[0];
    const secondSet = sets[1];

    const handleCalculate = useCallback(
        () => {
            const newMapping = generateMapping(adminLevels, firstSet.settings, secondSet.settings);
            setMapping(newMapping);
        },
        [firstSet, secondSet],
    );

    return (
        <div className={_cs(className, styles.home)}>
            <div className={styles.sidebar}>
                <AdminLevels adminLevels={adminLevels} />
                <Sets
                    adminLevels={adminLevels}
                    sets={sets}
                />
                <Button
                    onClick={handleCalculate}
                    variant="primary"
                >
                    Calculate
                </Button>
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
                    <LinkListing
                        data={mapping}
                        currentAdminLevel={currentAdminLevel}
                        firstSet={firstSet}
                        secondSet={secondSet}
                    />
                </div>
            </div>
        </div>
    );
}

export default Home;
