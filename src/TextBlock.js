import React from 'react';
import { Text, View, StyleSheet, Alert } from 'react-native';

const kiteApiUrl = "https://kite.sunnysab.cn/api/v1";

const styles = StyleSheet.create({
  main: {
    width: '100%',
    marginVertical: 20,
    padding: 20,
    backgroundColor: 'hsla(0, 0%, 98%, 0.9)',
  },
  text: {
    fontSize: 15,
    color: 'hsla(0, 0%, 0%, 1.0)',
  },
});

const fetchTextBlockData = async (roomId, auth) => {

  try {

    const response = await fetch(
      `${kiteApiUrl}/pay/room/${roomId}`, {
        headers: {
          contentType: 'multipart/form-data',
          Authorization: auth,
        },
      },
    );

    const json = await response.json();

    if (json.code === 200) {
      throw new Error(json.msg);
    } else {
      const data = json.data;

      data.power = data.power.toFixed(2);
      data.ts    = data.ts.slice(0, 16).replace('T', ' ');

      return data;
    }

  } catch (error) {
    Alert.alert('错误', error.message);
    console.error(error);
  }
};

const showTips = () => {
  Alert.alert(
    '提示',
    '此数据来源于学校在线电费查询平台。如有错误，请以充值机显示金额为准。',
  );
};

const TextBlock = props => {
  console.log(props);
  return props.data !== undefined && (
    <View style={styles.main}>
      <Text style={{alignSelf: 'flex-end'}} onPress={showTips}>
        数据不一致？
      </Text>
      <Text style={styles.text}>　房间号：{props.data.room}</Text>
      <Text style={styles.text}>剩余金额：{props.data.balance}</Text>
      <Text style={styles.text}>剩余电量：{props.data.power}</Text>
      <Text style={{fontSize: 17, marginTop: 10, color: '#bfbfbf'}}>
        更新时间：{props.data.ts}
      </Text>
    </View>
  );
};

export {TextBlock, fetchTextBlockData};
