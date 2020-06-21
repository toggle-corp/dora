import React, { useState, useCallback, useMemo } from 'react';
import { _cs, isDefined, isNotDefined } from '@togglecorp/fujs';

import TextOutput from '#components/TextOutput';
import Button from '#components/Button';
import Modal from '#components/Modal';
import SelectInput from '#components/SelectInput';

import {
    AdminLevel,
    AdminSet,
    GeoJson,
} from '../typings';
import {
    getProperty,
    generateMapping,
    Link,
} from '../utils';

import AddedItem from './AddedItem';
import styles from './styles.css';

export interface DeletedItemProps {
    from: Link['from'];
    name?: string;
    code?: string | number;
    feature: GeoJson;
}

function DeletedItem(props: DeletedItemProps) {
    const {
        from,
        name,
        code,
    } = props;

    return (
        <div
            className={_cs(styles.deletedItem, styles.item)}
            key={from}
        >
            <h5 className={styles.title}>{name}</h5>
            <TextOutput
                label="Code"
                value={code}
            />
        </div>
    );
}

interface LinkListingProps {
    currentAdminLevel: string;
    mapping: { [key: string]: Link[] } | undefined;
    firstSet: AdminSet;
    secondSet: AdminSet;
    className?: string;
    onAreasLink: (to: number, from: number, adminLevel: AdminLevel['key']) => void;
}
function LinkListing(props: LinkListingProps) {
    const {
        className,
        currentAdminLevel,
        mapping,
        firstSet,
        secondSet,
        onAreasLink,
    } = props;

    const handleAreasLink = useCallback((to: number, from: number) => {
        console.warn('inside here', currentAdminLevel);
        onAreasLink(to, from, currentAdminLevel);
    }, [currentAdminLevel, onAreasLink]);

    if (!mapping) {
        return (
            <div className={styles.noMapping}>
                Calcuation not triggered
            </div>
        );
    }

    const unitMapping = mapping[currentAdminLevel];
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
                feature: firstSettings.geoJson.features[item.from],
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
                feature: secondSettings.geoJson.features[item.to],
            };
        });

    if (added.length === 0 && deleted.length === 0) {
        return (
            <div className={styles.noMapping}>
                Hurrah!! There are no unlinked geo areas in this admin level!!
            </div>
        );
    }

    return (
        <div className={_cs(styles.links, className)}>
            {added.length > 0 && (
                <div className={styles.block}>
                    <h2>Addition</h2>
                    <div className={styles.blockContent}>
                        {added.map((item) => (
                            <AddedItem
                                className={_cs(styles.addedItem, styles.item)}
                                key={item.to}
                                to={item.to}
                                code={item.code}
                                name={item.name}
                                feature={item.feature}
                                deletedAreas={deleted}
                                onAreasLink={handleAreasLink}
                            />
                        ))}
                    </div>
                </div>
            )}
            {deleted.length > 0 && (
                <div className={styles.block}>
                    <h2>Deletion</h2>
                    <div className={styles.blockContent}>
                        {deleted.map((item) => (
                            <DeletedItem
                                key={item.from}
                                from={item.from}
                                code={item.code}
                                name={item.name}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default LinkListing;
