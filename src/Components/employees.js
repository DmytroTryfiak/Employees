import React, { useEffect, useState } from 'react';
import { alphabetReff, monthsReff } from './employee-data'
import './employees.css';

export function Employees() {
    const [employeesData, setEmployeesData] = useState()
    const [employeesChecked, setEmployeesChecked] = useState(new Set())
    const storageName = 'checkedBod'
    let employeesGroupedByAlphabet = []
    let employeesGroupedByMonth
    const fetchData = () => {
        fetch('https://yalantis-react-school-api.yalantis.com/api/task0/users')
            .then(response => response.json())
            .then(data => {
                setEmployeesData(data)
            });
    }
    const makeEmployeesGroupedByLetter = () => {
        if (!employeesData)
            return
        employeesData.sort((a, b) => {
            if (a.lastName > b.lastName) {
                return 1;
            }
            if (a.lastName < b.lastName) {
                return -1;
            }
            return 0;
        })
        let i = 0
        employeesGroupedByAlphabet = alphabetReff.map(element => {
            let items = []
            let empty = true
            while (true) {
                if (i < employeesData.length && employeesData[i].lastName.charAt(0) === element) {
                    const item = {
                        id: employeesData[i].id,
                        fullName: `${employeesData[i].lastName} ${employeesData[i].firstName}`,
                        checkedDob: employeesChecked.has(employeesData[i].id)
                    }
                    items.push(item)
                    i++
                    empty = false
                }
                else {
                    if (empty)
                        items.push(null)
                    break
                }
            }
            return {
                firstLetter: element,
                items: items,
            }
        })
    }
    const makeEmployeesGroupedByMonth = () => {
        if (!employeesData || employeesChecked.size === 0)
            return

        employeesData.sort((a, b) => {
            if (a.dob > b.dob) {
                return 1;
            }
            if (a.dob < b.dob) {
                return -1;
            }
            return 0;
        })

        employeesGroupedByMonth = []
        monthsReff.forEach((element, i) => {
            employeesGroupedByMonth[i] = {
                month: element,
                items: []
            }
        })

        employeesData.forEach(element => {
            if (!employeesChecked.has(element.id))
                return
            const itemDob = new Date(element.dob)
            const monthIndex = itemDob.getMonth()
            const item = {
                id: element.id,
                item: `${element.lastName} ${element.firstName} - ${itemDob.getDate()} ${monthsReff[itemDob.getMonth()]}, ${itemDob.getFullYear()} year`
            }
            employeesGroupedByMonth[monthIndex].items.push(item)
        })
    }
    const getDataFromStorage = () => {
        let data = localStorage.getItem(storageName)
        if (!data)
            return
        setEmployeesChecked(new Set(JSON.parse(data)))
    }
    const handleCheck = (id) => {
        employeesChecked.has(id) ? employeesChecked.delete(id) : employeesChecked.add(id)
        localStorage.setItem(storageName, JSON.stringify([...employeesChecked]))
        makeEmployeesGroupedByMonth()
        setEmployeesChecked(new Set(employeesChecked));
    }
    useEffect(() => {
        fetchData()
        getDataFromStorage()
    }, [])
    makeEmployeesGroupedByLetter()
    makeEmployeesGroupedByMonth()
    return (
        <div className='wrap' >
            <div className="employeesByAlphabetWrap">
                <h1 className='employeesTitle'> Employees</h1>
                <div className="employeesListByAlphabet">
                    {
                        employeesGroupedByAlphabet.map(element => {
                            return (
                                <EmployeeGroupByAlphabet key={element.firstLetter} employeesGroup={element} handleCheck={handleCheck} />
                            )
                        })
                    }
                </div>
            </div>
            <div className="employeesByMonthWrap">
                <h1 className='employeesTitle'> Employees birthday</h1>
                <div className="employeesListByMonth">
                    {
                        employeesGroupedByMonth ? (
                            employeesGroupedByMonth.map(element => {
                                return (
                                    element.items.length ?
                                        <EmployeeGroupByDob key={element.month} employeesGroupedByMonth={element} />
                                        :
                                        null
                                )
                            })
                        ) :
                            (
                                <p>No selected employees</p>
                            )
                    }
                </div>
            </div>
        </div>
    );
}

export function EmployeeGroupByAlphabet({ employeesGroup, handleCheck }) {
    return (
        <div className='employeesGroupByAlphabet'>
            <h2 className='groupTitle'>{employeesGroup.firstLetter}</h2>
            <ul className='itemList'>
                {
                    employeesGroup.items.map(element => {
                        return element ?
                            <EmployeeItem key={element.id} employee={element} handleCheck={handleCheck} />
                            :
                            <li key='0'>-----------------</li>
                    })
                }
            </ul>
        </div>
    )
}

export function EmployeeItem({ employee, handleCheck }) {
    return (
        <li>
            {employee.fullName}
            <input
                type="checkbox"
                checked={employee.checkedDob}
                onChange={handleCheck.bind(this, employee.id)}
            />
        </li>
    );
}

export function EmployeeGroupByDob({ employeesGroupedByMonth }) {
    return (
        <div className='employeesGroupByMonth'>
            <h2 className='groupTitle'>{employeesGroupedByMonth.month}</h2>
            <ul className='itemList'>
                {
                    employeesGroupedByMonth.items.map(element => <EmployeeItemForDob key={element.id} employee={element.item} />)
                }
            </ul>
        </div>
    )
}

export function EmployeeItemForDob({ employee }) {
    return (
        <li>
            {employee}
        </li>
    );
}