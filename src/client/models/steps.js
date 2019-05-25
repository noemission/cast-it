const initialState = [
    {
        id: 1,
        active: true,
        completed: false,
        title: 'Media',
        description: 'Choose media',
    }, {
        id: 2,
        active: false,
        disabled: true,
        completed: false,
        title: 'Device',
        description: 'Choose device to cast',
    }, {
        id: 3,
        active: false,
        disabled: true,
        completed: false,
        title: 'Play',
        description: 'Control media cast',
    }
];

export const steps = {
    state: initialState,
    reducers: {
        setActive(steps, payload) {
            return steps.map((step) => {
                if (step.id === payload) return { ...step, active: true, disabled: false, completed: false };
                if (step.id > payload) return { ...step, active: false, disabled: true, completed: false };
                return { ...step, active: false };
            })
        },
        setCompleted(steps, payload) {
            return steps.map((step) => {
                if (step.id === payload) return { ...step, completed: true };
                return step;
            })
        },
    },
}