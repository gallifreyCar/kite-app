import Icon from 'react-native-vector-icons/FontAwesome'
import { GestureResponderEvent, StyleSheet, View } from 'react-native'
import * as React from 'react'
import { useState } from 'react'
import { Button, Input, ThemeProvider } from 'react-native-elements'
import { LoginAndGetCookie } from '@/crawler/session/cookie'

export const Login = () => {
    const [state, setState] = useState({
        username: '',
        password: '',
    })
    const login = async (e: GestureResponderEvent) => {
        e.preventDefault()
        console.log('ready for login: ' + state.username + state.password)
        const { username, password } = state
        const cookie = await LoginAndGetCookie(username, password)
        // save to storage
    }
    return (
        <ThemeProvider>
            <View style={styles.container}>
                <Input
                    onChangeText={(text) => setState({ ...state, username: text })}
                    placeholder='请输入学号'
                    leftIcon={<Icon name='user-circle' size={24} color='black' />}
                />
                <Input
                    onChangeText={(text) => setState({ ...state, password: text })}
                    placeholder='请输入密码'
                    leftIcon={<Icon name='key' size={24} color='black' />}
                    secureTextEntry={true}
                />
                <Button
                    raised={true}
                    title=' 登录'
                    onPress={(e) => login(e)}
                    icon={<Icon name='arrow-right' size={15} color='white' />}
                />
            </View>
        </ThemeProvider>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    separator: {
        marginVertical: 30,
        height: 1,
        width: '80%',
    },
})
