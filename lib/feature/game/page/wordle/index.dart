/*
 * 代码来源：
 * https://github.com/nimone/wordle
 * 版权归原作者所有.
 */

import 'dart:convert';
import 'dart:math';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../../entity/game.dart';
import '../../init.dart';
import '../../util/upload.dart';
import '../action.dart';
import 'models/board_model.dart';
import 'widgets/alert_dialog.dart';
import 'widgets/board.dart';

class WordlePage extends StatefulWidget {
  const WordlePage({Key? key}) : super(key: key);

  @override
  State<WordlePage> createState() => _WordlePageState();
}

class _WordlePageState extends State<WordlePage> {
  Future<String> getRandomWord() async {
    final words = jsonDecode(
      await rootBundle.loadString('assets/game/words.json'),
    )['5'];
    return words[Random().nextInt(words.length)];
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Wordle'),
        actions: [helpButton(context)],
      ),
      body: FutureBuilder(
          future: getRandomWord().then((word) => BoardModel(word, rows: word.length + 1)),
          builder: (context, AsyncSnapshot<BoardModel> snapshot) {
            if (snapshot.data == null) return const Text('加载游戏文件失败');

            final board = snapshot.data!;
            final startTime = DateTime.now();
            return Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                SingleChildScrollView(
                  child: GameBoard(
                    board: board,
                    onWin: () async {
                      final costTime = DateTime.now().difference(startTime).inSeconds;
                      final score = costTime > 10 * 60 ? 0 : -costTime + 600;

                      // 存储游戏记录
                      final currentTime = DateTime.now();
                      final record =
                          GameRecord(GameType.wordle, score, startTime, currentTime.difference(startTime).inSeconds);
                      GameInitializer.gameRecord.append(record);

                      await showAlertDialog(
                        context,
                        title: '猜中了!',
                        actionText: '再来一局?',
                        onAction: () => setState(board.reset),
                        content: [
                          Text(
                            board.targetWord.toUpperCase(),
                            style: const TextStyle(
                              fontSize: 32,
                              color: Colors.green,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const SizedBox(height: 10),
                          Text('猜测 ${board.currentRow + 1}/${board.rows} 次'),
                        ],
                      );

                      uploadGameRecord(context, record);
                    },
                    onLose: () => showAlertDialog(
                      context,
                      title: '答案是',
                      actionText: '继续?',
                      onAction: () => setState(board.reset),
                      content: [
                        Text(
                          board.targetWord.toUpperCase(),
                          style: const TextStyle(
                            fontSize: 32,
                            color: Colors.red,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 20),
                ElevatedButton.icon(
                  onPressed: () => setState(board.reset),
                  icon: const Icon(Icons.play_arrow_rounded),
                  label: const Text('新游戏'),
                ),
              ],
            );
          }),
    );
  }
}
