//
//  FileProviderEnumerator.swift
//  vfs
//
//  Created by Oscar Beaumont on 5/4/2026.
//

import FileProvider

final class FileProviderEnumerator: NSObject, NSFileProviderEnumerator {
    private let enumeratedItemIdentifier: NSFileProviderItemIdentifier

    init(enumeratedItemIdentifier: NSFileProviderItemIdentifier) {
        self.enumeratedItemIdentifier = enumeratedItemIdentifier
        super.init()
    }

    func invalidate() {
        // TODO: perform invalidation of server connection if necessary
    }

    func enumerateItems(for observer: NSFileProviderEnumerationObserver, startingAt page: NSFileProviderPage) {
        guard let enumeration = RustFileProviderModel.enumeration(of: enumeratedItemIdentifier) else {
            observer.finishEnumeratingWithError(NSFileProviderError(.noSuchItem))
            return
        }

        let items = enumeration.items.map(FileProviderItem.init(item:))
        observer.didEnumerate(items)
        observer.finishEnumerating(upTo: nil)
    }

    func enumerateChanges(for observer: NSFileProviderChangeObserver, from anchor: NSFileProviderSyncAnchor) {
        observer.finishEnumeratingChanges(upTo: anchor, moreComing: false)
    }

    func currentSyncAnchor(completionHandler: @escaping (NSFileProviderSyncAnchor?) -> Void) {
        completionHandler(RustFileProviderModel.enumeration(of: enumeratedItemIdentifier).map {
            NSFileProviderSyncAnchor(Data($0.syncAnchor))
        })
    }
}
