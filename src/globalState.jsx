import Context from './context'
import {useState, useEffect} from 'react'

function GlobalState(props){

    const root = document.documentElement;
    
    const paleta = {
    primary: getComputedStyle(root).getPropertyValue('--color-primary'),
    secondary: getComputedStyle(root).getPropertyValue('--color-secondary'),
    tertiary: getComputedStyle(root).getPropertyValue('--color-tertiary'),
    text: getComputedStyle(root).getPropertyValue('--color-text'),
    };

    return(
        <Context.Provider value={{
            paleta:paleta,
        }}>
            {props.children}
        </Context.Provider>
    )
}

export default GlobalState;