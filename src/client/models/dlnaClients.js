import getDlnaClientsService from "../../server/dlnaClients";

export const dlnaClients = {
    state: [],
    reducers: {
        setDlnaClients(state, payload = []) {
            return [...payload]
        }
    },
    effects: (dispatch) => {
        let dlnaClientsService, updateInterval;
        const onDlnaClientsServiceUpdate = () => dispatch.dlnaClients.setDlnaClients(dlnaClientsService.players)

        return {
            startSearching() {
                dlnaClientsService = getDlnaClientsService();
                dlnaClientsService.on('update', onDlnaClientsServiceUpdate)
                updateInterval = setInterval(() => {
                    dlnaClientsService.update()
                }, 2500)
            },
            stopSearching() {
                dlnaClientsService.removeListener('update', onDlnaClientsServiceUpdate)
                clearInterval(updateInterval);
                this.setDlnaClients([])
            }
        }

    }
}