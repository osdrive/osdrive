//
//  FileProviderItem.swift
//  vfs
//
//  Created by Oscar Beaumont on 5/4/2026.
//

import FileProvider
import Foundation
import UniformTypeIdentifiers

enum DemoFileProviderModel {
    static let domainIdentifier = NSFileProviderDomainIdentifier("hello-world")
    static let domainDisplayName = "Hello World"
    static let helloFileIdentifier = NSFileProviderItemIdentifier("hello.txt")
    static let helloFileContents = Data("Hello World".utf8)
    static let contentVersion = Data("1".utf8)
    static let metadataVersion = Data("1".utf8)
    static let timestamp = Date(timeIntervalSince1970: 1_704_067_200)

    struct Item {
        let identifier: NSFileProviderItemIdentifier
        let parentIdentifier: NSFileProviderItemIdentifier
        let filename: String
        let contentType: UTType
        let capabilities: NSFileProviderItemCapabilities
        let childItemCount: NSNumber?
        let documentSize: NSNumber?
    }

    static let rootItem = Item(
        identifier: .rootContainer,
        parentIdentifier: .rootContainer,
        filename: domainDisplayName,
        contentType: .folder,
        capabilities: [.allowsContentEnumerating],
        childItemCount: 1,
        documentSize: nil
    )

    static let helloFile = Item(
        identifier: helloFileIdentifier,
        parentIdentifier: .rootContainer,
        filename: "hello.txt",
        contentType: .plainText,
        capabilities: [.allowsReading],
        childItemCount: nil,
        documentSize: NSNumber(value: helloFileContents.count)
    )

    static func item(for identifier: NSFileProviderItemIdentifier) -> Item? {
        switch identifier {
        case .rootContainer:
            return rootItem
        case helloFileIdentifier:
            return helloFile
        default:
            return nil
        }
    }

    static func children(of identifier: NSFileProviderItemIdentifier) -> [Item] {
        guard identifier == .rootContainer else {
            return []
        }

        return [helloFile]
    }
}

final class FileProviderItem: NSObject, NSFileProviderItem {
    private let item: DemoFileProviderModel.Item

    init(item: DemoFileProviderModel.Item) {
        self.item = item
        super.init()
    }

    convenience init?(identifier: NSFileProviderItemIdentifier) {
        guard let item = DemoFileProviderModel.item(for: identifier) else {
            return nil
        }

        self.init(item: item)
    }

    var itemIdentifier: NSFileProviderItemIdentifier {
        item.identifier
    }

    var parentItemIdentifier: NSFileProviderItemIdentifier {
        item.parentIdentifier
    }

    var capabilities: NSFileProviderItemCapabilities {
        item.capabilities
    }

    var itemVersion: NSFileProviderItemVersion {
        NSFileProviderItemVersion(
            contentVersion: DemoFileProviderModel.contentVersion,
            metadataVersion: DemoFileProviderModel.metadataVersion
        )
    }

    var filename: String {
        item.filename
    }

    var contentType: UTType {
        item.contentType
    }

    var childItemCount: NSNumber? {
        item.childItemCount
    }

    var documentSize: NSNumber? {
        item.documentSize
    }

    var creationDate: Date? {
        DemoFileProviderModel.timestamp
    }

    var contentModificationDate: Date? {
        DemoFileProviderModel.timestamp
    }
}
