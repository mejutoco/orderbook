import React, {ChangeEvent, useEffect, useState} from 'react';

import {useAppSelector, useAppDispatch} from '../../app/hooks';
import styles from './OrderBook.module.css';
import {reset, selectAsks, selectBids, updateAsks, updateBids} from './orderBookSlice';
import {BidAsks, Book} from './types';

export function OrderBook() {
    type Precision = 'P0' | 'P1' | 'P2' | 'P3' | 'P4';
    type Field = {
        channel_id: bigint,
        price: number,
        // period: bigint,
        count: bigint,
        amount: number,
    }

    type OrderType = 'bids' | 'asks';

    const BOOK: Book = {
        bids: {},
        asks: {},
    }

    const [precision, setPrecision] = useState<Precision>('P0');
    const [connected, setConnected] = useState(false);
    // const [wss, setWss] = useState(new WebSocket('wss://api-pub.bitfinex.com/ws/2'));
    const bids = useAppSelector(selectBids);
    const asks = useAppSelector(selectAsks);
    const dispatch = useAppDispatch();

    let wss:WebSocket;

    const connect = () => {
        // https://docs.bitfinex.com/reference#ws-public-books
        const precision: Precision = 'P0'
        wss = new WebSocket('wss://api-pub.bitfinex.com/ws/2');
        wss.onmessage = (msg: any) => {
            const data = JSON.parse(msg.data);
            if (data[1] === undefined) {
                return
            }
            const channel_id = data[0];
            const price: number = data[1][0];
            const count: number = data[1][1];
            const amount: number = data[1][2];

            let orderType: OrderType = 'bids';
            if (amount > 0) {
                orderType = 'bids';
            }
            if (amount < 0) {
                orderType = 'asks';
            }

            if (count > 0) {
                if (price in BOOK[orderType]) {
                    BOOK[orderType][price]['count'] += count;
                    BOOK[orderType][price]['amount'] += amount;
                } else {
                    BOOK[orderType][price] = {
                        amount: amount,
                        count: count
                    };
                }
            }
            if (count == 0) {
                if (amount == 1) {
                    delete BOOK['bids'][price];
                }
                if (amount == -1) {
                    delete BOOK['asks'][price];
                }
            }

            // bids and asks
            let bids = [];
            for (const key in BOOK['bids']) {
                const price: number = +key;
                bids[bids.length] = {
                    price: price,
                    count: BOOK['bids'][key]['count'],
                    amount: BOOK['bids'][key]['amount'],
                }
            }
            bids.reverse()

            let asks = [];
            for (const key in BOOK['asks']) {
                const price: number = +key;
                asks[asks.length] = {
                    price: price,
                    count: BOOK['asks'][key]['count'],
                    amount: Math.abs(BOOK['asks'][key]['amount']),
                }
            }
            asks.reverse()

            dispatch(updateBids(bids))
            dispatch(updateAsks(asks))
        }
        let msg = JSON.stringify({
            event: 'subscribe',
            channel: 'book',
            symbol: 'tBTCUSD',
            PRECISION: precision,
        })

        wss.onopen = () => {
            wss.send(msg)
            setConnected(true);
        }
        return wss
    };
    const disconnect = () => {
        // TODO: fix wss ref
        if (connected) {
            wss.close();
        }
    };
    const handlePrecisionChange = (event: ChangeEvent<HTMLSelectElement>) => {
        // @ts-ignore
        const newPre: Precision = event.target.value;
        setPrecision(newPre);
        disconnect();
        dispatch(reset());
        connect();
    }

    // TODO: check regularly and reconnect
    // setInterval(() => {
    //     if (wss.readyState === WebSocket.CLOSED) {
    //         connect();
    //     }
    // }, 10000);


    useEffect(() => {
        connect();
    }, []);

    return (
        <div className={styles.cont}>
            <div className={styles.contButtons}>
                Order BookBTC/USD
                <button onClick={connect} className={styles.btn}>Connect</button>
                <button onClick={disconnect} className={styles.btn}>Disconnect</button>
                <select value={precision} onChange={handlePrecisionChange}>
                    <option value="P0">P0</option>
                    <option value="P1">P1</option>
                    <option value="P2">P2</option>
                    <option value="P3">P3</option>
                    <option value="P4">P4</option>
                </select>
            </div>
            <div className={styles.bidsAsks}>
                <table className={styles.bids}>
                    <thead>
                    <tr>
                        <td>COUNT</td>
                        <td>AMOUNT</td>
                        <td>TOTAL</td>
                        <td>PRICE</td>
                    </tr>
                    </thead>
                    <tbody>
                    {bids.map((bid, i) => (
                        <tr key={i}>
                            <td>{bid.count}</td>
                            <td>{bid.amount}</td>
                            <td>{0}</td>
                            <td>{bid.price}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                <table className={styles.asks}>
                    <thead>
                    <tr>

                        <td>PRICE</td>
                        <td>TOTAL</td>
                        <td>AMOUNT</td>
                        <td>COUNT</td>
                    </tr>
                    </thead>
                    <tbody>
                    {asks.map((ask, i) => (
                        <tr key={i}>
                            <td>{ask.price}</td>
                            <td>{0}</td>
                            <td>{ask.amount}</td>
                            <td>{ask.count}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
