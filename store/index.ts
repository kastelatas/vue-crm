export const state = () => ({
  selectClient: null,
  saveInputTexts:[]
})


export const actions = {
 inputTexts({commit}, payload) {
    commit('setInputTexts', payload)
  }
}

export const mutations = {
  setInputTexts(state, payload) {
    // console.log(state.saveInputTexts,payload)
    if (state.saveInputTexts.length == 0) {
      state.saveInputTexts.push(payload)
    }
    state.saveInputTexts.forEach(item => {
      console.log(item.selectedChatId, payload.selectedChatId);
      if (item.selectedChatId !== payload.selectedChatId){
        state.saveInputTexts.push(payload)
        console.log(state.saveInputTexts)
      }
    })

  }
}

export const  getters = {

}

export const modules = {

}
