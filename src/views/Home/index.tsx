import React, { useState, useCallback, useMemo } from 'react';
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
import Map from './ComparisonMap';
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

function addUniqueIds(geoJson: GeoJson) {
    const newFeatures = geoJson.features.map((f, index) => ({
        ...f,
        id: index + 1,
    }));

    return ({
        ...geoJson,
        features: newFeatures,
    });
}

interface LinkListingProps {
    currentAdminLevel: string;
    data: { [key: string]: Link[] } | undefined;
    firstSet: AdminSet;
    secondSet: AdminSet;
    className?: string;
}
function LinkListing(props: LinkListingProps) {
    const {
        className,
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
        <div className={_cs(styles.links, className)}>
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
                geoJson: addUniqueIds(oldCountry) as unknown as GeoJson,
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
                geoJson: addUniqueIds(oldDepartment) as unknown as GeoJson,
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
                geoJson: addUniqueIds(oldMuni) as unknown as GeoJson,
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
                geoJson: addUniqueIds(newCountry) as unknown as GeoJson,
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
                geoJson: addUniqueIds(newDepartment) as unknown as GeoJson,
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
                geoJson: addUniqueIds(newMuni) as unknown as GeoJson,
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

interface AdminLevelWithCount extends AdminLevel {
    count?: number;
}

const optionKeySelector = (d: AdminLevelWithCount) => d.key;

const optionLabelSelector = (d: AdminLevelWithCount) => (
    isDefined(d.count) ? `${d.name} (${d.count})` : d.name
);

interface Props {
    className?: string;
}

function Home(props: Props) {
    const { className } = props;

    const [currentAdminLevel, setCurrentAdminLevel] = useState(adminLevels[0].key);
    const [mapping, setMapping] = useState<{ [key: string]: Link[] } | undefined>(undefined);

    const firstSet = sets[0];
    const secondSet = sets[1];
    const oldSource = useMemo(() => (
        firstSet.settings.find((s) => s.adminLevel === currentAdminLevel)?.geoJson
    ), [currentAdminLevel]);

    const newSource = useMemo(() => (
        secondSet.settings.find((s) => s.adminLevel === currentAdminLevel)?.geoJson
    ), [currentAdminLevel]);

    const handleCalculate = useCallback(
        () => {
            const newMapping = generateMapping(adminLevels, firstSet.settings, secondSet.settings);
            setMapping(newMapping);
        },
        [firstSet, secondSet],
    );

    const adminLevelsWithCount = useMemo(() => {
        if (!mapping) {
            return adminLevels;
        }
        return adminLevels.map((level) => ({
            ...level,
            count: mapping[level.key]
                .filter((link) => isNotDefined(link.to) || isNotDefined(link.from)).length,
        }));
    }, [mapping]);

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
                    options={adminLevelsWithCount}
                    optionKeySelector={optionKeySelector}
                    optionLabelSelector={optionLabelSelector}
                    value={currentAdminLevel}
                    onChange={setCurrentAdminLevel}
                />
                <div className={styles.content}>
                    <Map
                        className={styles.map}
                        currentAdminLevel={currentAdminLevel}
                        oldSource={oldSource}
                        newSource={newSource}
                    />
                    <LinkListing
                        className={styles.linkListing}
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
