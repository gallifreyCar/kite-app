import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:kite/module/symbol.dart';

import '../../activity/using.dart';
import '../init.dart';
import 'editor.dart';

class MyTimetablePage extends StatefulWidget {
  const MyTimetablePage({Key? key}) : super(key: key);

  @override
  State<MyTimetablePage> createState() => _MyTimetablePageState();
}

class _MyTimetablePageState extends State<MyTimetablePage> {
  final timetableStorage = TimetableInit.timetableStorage;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: i18n.timetableMineTitle.txt,
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {},
        child: const Icon(Icons.add_outlined),
      ),
      body: Padding(
        padding: const EdgeInsets.all(12),
        child: buildTimetables(context),
      ),
    );
  }

  Widget buildTimetables(BuildContext ctx) {
    final tableNames = timetableStorage.tableNames ?? [];
    final currentTableName = timetableStorage.currentTableName;
    return ListView(
        children: tableNames.map((e) {
      final meta = timetableStorage.getTableMetaByName(e);
      if (meta == null) {
        return const SizedBox();
      } else {
        return buildTimetableEntry(ctx, meta, isSelected: currentTableName == meta.name);
      }
    }).toList());
  }

  Widget buildTimetableEntry(BuildContext ctx, TimetableMeta meta, {required bool isSelected}) {
    return CupertinoContextMenu(
      actions: [
        CupertinoContextMenuAction(
          onPressed: () {
            Navigator.pop(ctx);
            showModalBottomSheet(
                context: ctx,
                isScrollControlled: true,
                shape: const ContinuousRectangleBorder(borderRadius: BorderRadius.all(Radius.circular(48))),
                builder: (ctx) {
                  return Padding(
                      padding: EdgeInsets.only(bottom: MediaQuery.of(ctx).viewInsets.bottom),
                      child: TimetableEditor(meta: meta));
                });
          },
          trailingIcon: CupertinoIcons.doc_text,
          child: Text('Edit'),
        ),
        CupertinoContextMenuAction(
          onPressed: () async {
            Navigator.pop(context);
            final date = await showDatePicker(
              context: context,
              initialDate: meta.startDate,
              currentDate: DateTime.now(),
              firstDate: DateTime(DateTime.now().year),
              lastDate: DateTime(DateTime.now().year + 2),
              selectableDayPredicate: (DateTime dataTime) => dataTime.weekday == DateTime.monday,
            );
            if (date != null) {
              meta.startDate = DateTime(date.year, date.month, date.day, 8, 20);
              timetableStorage.addTableMeta(meta.name, meta);
            }
          },
          trailingIcon: CupertinoIcons.time,
          child: Text('Set Start Time'),
        ),
        CupertinoContextMenuAction(
          onPressed: () {
            Navigator.pop(context);
            timetableStorage.removeTable(meta.name);
            setState(() {});
          },
          isDestructiveAction: true,
          trailingIcon: CupertinoIcons.delete,
          child: Text('Delete'),
        ),
      ],
      child: Card(
        child: Padding(
            padding: const EdgeInsets.all(20),
            child: SingleChildScrollView(
              child: Column(
                children: [
                  Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                    Text(
                      meta.name,
                      overflow: TextOverflow.ellipsis,
                      style: ctx.textTheme.titleMedium,
                    ),
                    if (isSelected) const Icon(Icons.check, color: Colors.green)
                  ]),
                  Align(
                    alignment: Alignment.centerLeft,
                    child: Text(
                      meta.description,
                      overflow: TextOverflow.ellipsis,
                    ),
                  )
                ],
              ),
            )),
      ),
    );
  }
}
