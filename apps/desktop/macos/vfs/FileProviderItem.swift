import FileProvider
import Foundation
import UniformTypeIdentifiers

enum RustFileProviderModel {
    static let rootIdentifier = "__root__"
    static let workingSetIdentifier = "__working_set__"

    struct Item: Decodable {
        let itemIdentifier: String
        let parentItemIdentifier: String
        let filename: String
        let contentType: String
        let capabilities: UInt
        let childItemCount: UInt?
        let documentSize: UInt?
        let creationTimestamp: TimeInterval
        let contentModificationTimestamp: TimeInterval
        let contentVersion: [UInt8]
        let metadataVersion: [UInt8]
    }

    struct Enumeration: Decodable {
        let items: [Item]
        let syncAnchor: [UInt8]
    }

    struct MaterializedItem: Decodable {
        let filePath: String
        let item: Item
    }

    static func item(for identifier: NSFileProviderItemIdentifier) -> Item? {
        guard let result = identifierToken(identifier).withCString({ token in
            osdrive_vfs_item_json(token)
        }) else {
            return nil
        }

        defer {
            osdrive_json_result_free(result)
        }

        if result.pointee.error_message != nil {
            return nil
        }

        guard let payload = result.pointee.payload_json else {
            return nil
        }

        let data = Data(String(cString: payload).utf8)
        return try? JSONDecoder().decode(Item.self, from: data)
    }

    static func enumeration(of identifier: NSFileProviderItemIdentifier) -> Enumeration? {
        guard let result = identifierToken(identifier).withCString({ token in
            osdrive_vfs_enumeration_json(token)
        }) else {
            return nil
        }

        defer {
            osdrive_json_result_free(result)
        }

        if result.pointee.error_message != nil {
            return nil
        }

        guard let payload = result.pointee.payload_json else {
            return nil
        }

        let data = Data(String(cString: payload).utf8)
        return try? JSONDecoder().decode(Enumeration.self, from: data)
    }

    static func fetchContents(for identifier: NSFileProviderItemIdentifier, in directory: URL) throws -> MaterializedItem {
        try identifierToken(identifier).withCString { identifierPointer in
            try directory.path.withCString { pathPointer in
                guard let result = osdrive_vfs_fetch_contents_json(identifierPointer, pathPointer) else {
                    throw CocoaError(.fileWriteUnknown)
                }

                defer {
                    osdrive_json_result_free(result)
                }

                if let errorMessage = result.pointee.error_message {
                    throw NSError(
                        domain: NSCocoaErrorDomain,
                        code: NSFileWriteUnknownError,
                        userInfo: [NSLocalizedDescriptionKey: String(cString: errorMessage)]
                    )
                }

                guard let payload = result.pointee.payload_json else {
                    throw CocoaError(.fileWriteUnknown)
                }

                let data = Data(String(cString: payload).utf8)
                return try JSONDecoder().decode(MaterializedItem.self, from: data)
            }
        }
    }

    static func identifier(from token: String) -> NSFileProviderItemIdentifier {
        switch token {
        case rootIdentifier:
            return .rootContainer
        case workingSetIdentifier:
            return .workingSet
        default:
            return NSFileProviderItemIdentifier(token)
        }
    }

    static func identifierToken(_ identifier: NSFileProviderItemIdentifier) -> String {
        if identifier == .rootContainer {
            return rootIdentifier
        }

        if identifier == .workingSet {
            return workingSetIdentifier
        }

        return identifier.rawValue
    }

    static func contentType(_ identifier: String) -> UTType {
        UTType(identifier) ?? .data
    }
}

final class FileProviderItem: NSObject, NSFileProviderItem {
    private let item: RustFileProviderModel.Item

    init(item: RustFileProviderModel.Item) {
        self.item = item
        super.init()
    }

    convenience init?(identifier: NSFileProviderItemIdentifier) {
        guard let item = RustFileProviderModel.item(for: identifier) else {
            return nil
        }

        self.init(item: item)
    }

    var itemIdentifier: NSFileProviderItemIdentifier {
        RustFileProviderModel.identifier(from: item.itemIdentifier)
    }

    var parentItemIdentifier: NSFileProviderItemIdentifier {
        RustFileProviderModel.identifier(from: item.parentItemIdentifier)
    }

    var capabilities: NSFileProviderItemCapabilities {
        NSFileProviderItemCapabilities(rawValue: item.capabilities)
    }

    var itemVersion: NSFileProviderItemVersion {
        NSFileProviderItemVersion(
            contentVersion: Data(item.contentVersion),
            metadataVersion: Data(item.metadataVersion)
        )
    }

    var filename: String {
        item.filename
    }

    var contentType: UTType {
        RustFileProviderModel.contentType(item.contentType)
    }

    var childItemCount: NSNumber? {
        item.childItemCount.map(NSNumber.init(value:))
    }

    var documentSize: NSNumber? {
        item.documentSize.map(NSNumber.init(value:))
    }

    var creationDate: Date? {
        Date(timeIntervalSince1970: item.creationTimestamp)
    }

    var contentModificationDate: Date? {
        Date(timeIntervalSince1970: item.contentModificationTimestamp)
    }
}
