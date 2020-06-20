import React from 'react';
import { NavLink } from 'react-router-dom';
import { _cs } from '@togglecorp/fujs';

import styles from './styles.css';

interface Props {
    className?: string;
}

const Navbar = (props: Props) => {
    const { className } = props;

    return (
        <nav className={_cs(className, styles.navbar)}>
            <NavLink
                exact
                className={styles.appBrand}
                activeClassName={styles.active}
                to="/"
            >
                Dora
            </NavLink>
        </nav>
    );
};

export default Navbar;
