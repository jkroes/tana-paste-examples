{
  "translatorID":"dda092d2-a257-46af-b9a3-2f04a55cb04f",
  "translatorType":2,
  "label":"Tana Metadata Export",
  "creator":"Stian Håklev based on Joel Chan's work",
  "target":"md",
  "minVersion":"2.0",
  "maxVersion":"",
  "priority":200,
  "inRepository":false,
  "lastUpdated":"2022-09-07 - 10:15"
  }

  function doExport() {
    Zotero.write('%%tana%%\n');
    var item;
    while (item = Zotero.nextItem()) {
      // title (node name)
      Zotero.write('- ' + item.title + ' #zotero-item\n');

      // status (defaults to "Unread")
      Zotero.write('  - Status:: Unread\n');

      // library (defaults to "CDPR")
      //Zotero.write('  - Library:: \n')

      // date
      var date = Zotero.Utilities.strToDate(item.date);
      var dateString = '[[date:';
      if (date.year) dateString += String(date.year).padStart(4, '0');
      if (date.month) dateString += ('-' + String(date.month + 1).padStart(2, '0'));
      if (date.day) dateString += ('-' + String(date.day).padStart(2, '0'));
      dateString += ']]';
      if (dateString === "[[date:]]") dateString = '';
      Zotero.write('  - Date:: ' + dateString + '\n');

      // creator
      Zotero.write('  - Creator:: \n');
      // write authors as indented nodes
      for (author in item.creators){
        Zotero.write('    - [[' + (item.creators[author].firstName||'') + ' ' + (item.creators[author].lastName||'') + ' #person]]\n');
      }
      Zotero.write('\n');

      // publication
      // Zotero.write('  - Publication:: ')
      // Zotero.write((item.publicationTitle ||'')+ '\n')

      // url with citation
      // Zotero.write('  - URL:: ' + (item.url||'') + '\n');

      // zotero link
      var library_id = item.libraryID ? item.libraryID : 0;
      var itemLink = 'zotero://select/items/' + library_id + '_' + item.key;
      Zotero.write('  - Item::' + itemLink + '\n');

      // abstracts for e.g. math articles on Wikipedia need to be sanitized, or
      // they don't render correctly in Tana
      // Zotero.write('  - Abstract:: '+  (item.abstractNote || '')+ '\n')
    }
  }
