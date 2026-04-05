import Cocoa
import UniformTypeIdentifiers

private struct OpendriveShareUploadResult {
    let share_url: UnsafeMutablePointer<CChar>?
    let error_message: UnsafeMutablePointer<CChar>?
}

private struct OpendriveJsonResult {
    let payload_json: UnsafeMutablePointer<CChar>?
    let error_message: UnsafeMutablePointer<CChar>?
}

private struct PreparedSharedFilePayload: Decodable {
    let filePath: String
    let suggestedName: String
    let contentType: String
}

@_silgen_name("opendrive_share_upload")
private func opendrive_share_upload(
    _ serverBaseURL: UnsafePointer<CChar>,
    _ filePath: UnsafePointer<CChar>,
    _ displayName: UnsafePointer<CChar>,
    _ contentType: UnsafePointer<CChar>
) -> UnsafeMutablePointer<OpendriveShareUploadResult>?

@_silgen_name("opendrive_share_result_free")
private func opendrive_share_result_free(_ result: UnsafeMutablePointer<OpendriveShareUploadResult>?)

@_silgen_name("opendrive_share_prepare_file")
private func opendrive_share_prepare_file(
    _ sourceFilePath: UnsafePointer<CChar>,
    _ suggestedName: UnsafePointer<CChar>,
    _ temporaryDirectory: UnsafePointer<CChar>
) -> UnsafeMutablePointer<OpendriveJsonResult>?

@_silgen_name("opendrive_json_result_free")
private func opendrive_json_result_free(_ result: UnsafeMutablePointer<OpendriveJsonResult>?)

@_silgen_name("opendrive_share_describe_file")
private func opendrive_share_describe_file(
    _ sourceFilePath: UnsafePointer<CChar>
) -> UnsafeMutablePointer<OpendriveJsonResult>?

@_silgen_name("opendrive_share_normalize_display_name")
private func opendrive_share_normalize_display_name(
    _ displayName: UnsafePointer<CChar>
) -> UnsafeMutablePointer<OpendriveJsonResult>?

private struct SharedFile {
    let url: URL
    let suggestedName: String
    let contentType: String
}

@MainActor
final class ShareViewController: NSViewController, NSTextFieldDelegate {
    private let titleLabel = NSTextField(labelWithString: "Create share link")
    private let subtitleLabel = NSTextField(labelWithString: "")
    private let displayNameLabel = NSTextField(labelWithString: "Display name")
    private let displayNameField = NSTextField(string: "")
    private let statusLabel = NSTextField(labelWithString: "")
    private let cancelButton = NSButton(title: "Cancel", target: nil, action: nil)
    private let sendButton = NSButton(title: "Upload and copy link", target: nil, action: nil)

    private var sharedFile: SharedFile?
    private var isUploading = false

    override func loadView() {
        self.view = NSView(frame: NSRect(x: 0, y: 0, width: 460, height: 220))
    }

    override func viewDidLoad() {
        super.viewDidLoad()

        preferredContentSize = NSSize(width: 460, height: 220)
        configureUI()

        Task {
            await prepareSharedFile()
        }
    }

    private func configureUI() {
        view.wantsLayer = true

        titleLabel.font = .systemFont(ofSize: 20, weight: .semibold)

        subtitleLabel.font = .systemFont(ofSize: 12)
        subtitleLabel.textColor = .secondaryLabelColor
        subtitleLabel.lineBreakMode = .byTruncatingMiddle

        displayNameLabel.font = .systemFont(ofSize: 12, weight: .medium)
        displayNameField.placeholderString = "Quarterly index export"
        displayNameField.delegate = self
        displayNameField.target = self
        displayNameField.action = #selector(displayNameChanged(_:))

        statusLabel.font = .systemFont(ofSize: 12)
        statusLabel.textColor = .secondaryLabelColor
        statusLabel.lineBreakMode = .byWordWrapping
        statusLabel.maximumNumberOfLines = 3

        cancelButton.target = self
        cancelButton.action = #selector(cancel(_:))

        sendButton.target = self
        sendButton.action = #selector(send(_:))
        sendButton.bezelStyle = .rounded
        sendButton.keyEquivalent = "\r"

        let fieldStack = NSStackView(views: [displayNameLabel, displayNameField])
        fieldStack.orientation = .vertical
        fieldStack.spacing = 6
        fieldStack.alignment = .leading

        let bodyStack = NSStackView(views: [titleLabel, subtitleLabel, fieldStack, statusLabel])
        bodyStack.orientation = .vertical
        bodyStack.spacing = 12
        bodyStack.translatesAutoresizingMaskIntoConstraints = false
        bodyStack.setCustomSpacing(18, after: subtitleLabel)

        let actionStack = NSStackView(views: [cancelButton, sendButton])
        actionStack.orientation = .horizontal
        actionStack.spacing = 8
        actionStack.alignment = .centerY
        actionStack.translatesAutoresizingMaskIntoConstraints = false

        view.addSubview(bodyStack)
        view.addSubview(actionStack)

        NSLayoutConstraint.activate([
            bodyStack.topAnchor.constraint(equalTo: view.topAnchor, constant: 20),
            bodyStack.leadingAnchor.constraint(equalTo: view.leadingAnchor, constant: 20),
            bodyStack.trailingAnchor.constraint(equalTo: view.trailingAnchor, constant: -20),

            displayNameField.widthAnchor.constraint(equalTo: bodyStack.widthAnchor),

            actionStack.topAnchor.constraint(greaterThanOrEqualTo: bodyStack.bottomAnchor, constant: 18),
            actionStack.trailingAnchor.constraint(equalTo: view.trailingAnchor, constant: -20),
            actionStack.bottomAnchor.constraint(equalTo: view.bottomAnchor, constant: -20),
        ])

        renderIdleState(message: "Loading shared file...")
    }

    @objc
    private func displayNameChanged(_ sender: NSTextField) {
        if sender.stringValue.count > 180 {
            sender.stringValue = String(sender.stringValue.prefix(180))
        }

        updateSendButtonState()
    }

    func controlTextDidChange(_ notification: Notification) {
        guard let field = notification.object as? NSTextField, field == displayNameField else {
            return
        }

        displayNameChanged(field)
    }

    private func updateSendButtonState() {
        let hasFile = sharedFile != nil
        let hasName = !displayNameField.stringValue.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
        sendButton.isEnabled = hasFile && hasName && !isUploading
    }

    private func renderIdleState(message: String) {
        statusLabel.stringValue = message
        statusLabel.textColor = .secondaryLabelColor
        displayNameField.isEnabled = !isUploading
        cancelButton.isEnabled = !isUploading
        updateSendButtonState()
    }

    private func renderError(_ message: String) {
        statusLabel.stringValue = message
        statusLabel.textColor = .systemRed
        isUploading = false
        sendButton.title = "Upload and copy link"
        displayNameField.isEnabled = true
        cancelButton.isEnabled = true
        updateSendButtonState()
    }

    private func renderUploading() {
        isUploading = true
        statusLabel.stringValue = "Uploading file and generating a share link..."
        statusLabel.textColor = .secondaryLabelColor
        displayNameField.isEnabled = false
        cancelButton.isEnabled = false
        sendButton.isEnabled = false
        sendButton.title = "Uploading..."
    }

    private func renderReady(file: SharedFile) {
        subtitleLabel.stringValue = file.url.lastPathComponent
        if displayNameField.stringValue.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
            displayNameField.stringValue = file.suggestedName
        }

        renderIdleState(message: "The generated share link will be copied to your clipboard.")
    }

    private func renderSuccess(_ shareURL: String) {
        statusLabel.stringValue = "Copied link to clipboard. Closing share sheet..."
        statusLabel.textColor = .systemGreen
        subtitleLabel.stringValue = shareURL
        sendButton.title = "Done"
        sendButton.isEnabled = false
    }

    private func prepareSharedFile() async {
        do {
            guard let extensionItem = extensionContext?.inputItems.first as? NSExtensionItem,
                  let attachments = extensionItem.attachments,
                  !attachments.isEmpty else {
                throw ShareError("No file was provided to the share extension.")
            }

            let file = try await loadSharedFile(from: attachments)
            sharedFile = file
            renderReady(file: file)
        } catch {
            renderError(error.localizedDescription)
        }
    }

    @objc
    private func send(_ sender: Any?) {
        guard !isUploading else {
            return
        }

        guard let sharedFile else {
            renderError("No file is available to upload.")
            return
        }

        let displayName: String

        do {
            displayName = try normalizeDisplayName(displayNameField.stringValue)
        } catch {
            renderError(error.localizedDescription)
            return
        }

        renderUploading()

        Task {
            do {
                let shareURL = try await upload(sharedFile: sharedFile, displayName: displayName)
                copyToClipboard(shareURL)
                renderSuccess(shareURL)
                try await Task.sleep(nanoseconds: 700_000_000)
                extensionContext?.completeRequest(returningItems: [], completionHandler: nil)
            } catch {
                renderError(error.localizedDescription)
            }
        }
    }

    @objc
    private func cancel(_ sender: Any?) {
        let cancelError = NSError(domain: NSCocoaErrorDomain, code: NSUserCancelledError, userInfo: nil)
        extensionContext?.cancelRequest(withError: cancelError)
    }

    private func copyToClipboard(_ value: String) {
        let pasteboard = NSPasteboard.general
        pasteboard.clearContents()
        pasteboard.setString(value, forType: .string)
    }

    private func loadSharedFile(from attachments: [NSItemProvider]) async throws -> SharedFile {
        var lastError: Error?

        for provider in attachments {
            for identifier in provider.registeredTypeIdentifiers {
                do {
                    if let file = try await loadFileRepresentation(from: provider, typeIdentifier: identifier) {
                        return file
                    }
                } catch {
                    lastError = error
                }
            }

            if provider.hasItemConformingToTypeIdentifier(UTType.item.identifier) {
                do {
                    if let file = try await loadFileRepresentation(from: provider, typeIdentifier: UTType.item.identifier) {
                        return file
                    }
                } catch {
                    lastError = error
                }
            }

            if provider.hasItemConformingToTypeIdentifier(UTType.fileURL.identifier) {
                do {
                    if let file = try await loadFileURL(from: provider) {
                        return file
                    }
                } catch {
                    lastError = error
                }
            }
        }

        if let lastError {
            throw ShareError("Could not read the shared file: \(lastError.localizedDescription)")
        }

        throw ShareError("This share extension currently supports files from disk.")
    }

    private func loadFileURL(from provider: NSItemProvider) async throws -> SharedFile? {
        try await withCheckedThrowingContinuation { continuation in
            provider.loadItem(forTypeIdentifier: UTType.fileURL.identifier, options: nil) { item, error in
                if let error {
                    continuation.resume(throwing: error)
                    return
                }

                do {
                    if let url = item as? URL {
                        continuation.resume(returning: try self.describeSharedFile(at: url))
                        return
                    }

                    if let data = item as? Data,
                       let url = NSURL(absoluteURLWithDataRepresentation: data, relativeTo: nil) as URL? {
                        continuation.resume(returning: try self.describeSharedFile(at: url))
                        return
                    }

                    if let string = item as? String,
                       let url = URL(string: string),
                       url.isFileURL {
                        continuation.resume(returning: try self.describeSharedFile(at: url))
                        return
                    }

                    continuation.resume(returning: nil)
                } catch {
                    continuation.resume(throwing: error)
                }
            }
        }
    }

    private func loadFileRepresentation(from provider: NSItemProvider, typeIdentifier: String) async throws -> SharedFile? {
        try await withCheckedThrowingContinuation { continuation in
            provider.loadFileRepresentation(forTypeIdentifier: typeIdentifier) { url, error in
                if let error {
                    continuation.resume(throwing: error)
                    return
                }

                guard let url else {
                    continuation.resume(returning: nil)
                    return
                }

                do {
                    let file = try self.makePersistentSharedFile(fromTemporaryURL: url)
                    continuation.resume(returning: file)
                } catch {
                    continuation.resume(throwing: error)
                }
            }
        }
    }

    nonisolated private func makePersistentSharedFile(fromTemporaryURL temporaryURL: URL) throws -> SharedFile {
        let tempDirectory = FileManager.default.temporaryDirectory.appendingPathComponent("share-extension", isDirectory: true)
        let payload = try temporaryURL.path.withCString { sourcePathPointer in
            try temporaryURL.lastPathComponent.withCString { suggestedNamePointer in
                try tempDirectory.path.withCString { temporaryDirectoryPointer in
                    guard let result = opendrive_share_prepare_file(
                        sourcePathPointer,
                        suggestedNamePointer,
                        temporaryDirectoryPointer
                    ) else {
                        throw ShareError("Could not prepare the shared file.")
                    }

                    defer {
                        opendrive_json_result_free(result)
                    }

                    if let errorPointer = result.pointee.error_message {
                        throw ShareError(String(cString: errorPointer))
                    }

                    guard let payloadPointer = result.pointee.payload_json else {
                        throw ShareError("Could not prepare the shared file.")
                    }

                    let payloadData = Data(String(cString: payloadPointer).utf8)
                    return try JSONDecoder().decode(PreparedSharedFilePayload.self, from: payloadData)
                }
            }
        }

        let destinationURL = URL(fileURLWithPath: payload.filePath)
        return SharedFile(url: destinationURL, suggestedName: payload.suggestedName, contentType: payload.contentType)
    }

    nonisolated private func describeSharedFile(at url: URL) throws -> SharedFile {
        let payload = try url.path.withCString { sourcePathPointer in
            guard let result = opendrive_share_describe_file(sourcePathPointer) else {
                throw ShareError("Could not inspect the shared file.")
            }

            defer {
                opendrive_json_result_free(result)
            }

            if let errorPointer = result.pointee.error_message {
                throw ShareError(String(cString: errorPointer))
            }

            guard let payloadPointer = result.pointee.payload_json else {
                throw ShareError("Could not inspect the shared file.")
            }

            let payloadData = Data(String(cString: payloadPointer).utf8)
            return try JSONDecoder().decode(PreparedSharedFilePayload.self, from: payloadData)
        }

        return SharedFile(
            url: URL(fileURLWithPath: payload.filePath),
            suggestedName: payload.suggestedName,
            contentType: payload.contentType
        )
    }

    nonisolated private func normalizeDisplayName(_ displayName: String) throws -> String {
        try displayName.withCString { displayNamePointer in
            guard let result = opendrive_share_normalize_display_name(displayNamePointer) else {
                throw ShareError("Could not prepare the file name.")
            }

            defer {
                opendrive_json_result_free(result)
            }

            if let errorPointer = result.pointee.error_message {
                throw ShareError(String(cString: errorPointer))
            }

            guard let payloadPointer = result.pointee.payload_json else {
                throw ShareError("Could not prepare the file name.")
            }

            let payloadData = Data(String(cString: payloadPointer).utf8)
            return try JSONDecoder().decode(String.self, from: payloadData)
        }
    }

    nonisolated private func upload(sharedFile: SharedFile, displayName: String) async throws -> String {
        let serverBaseURL = try serverBaseURL().absoluteString

        return try serverBaseURL.withCString { serverBaseURLPointer in
            try sharedFile.url.path.withCString { filePathPointer in
                try displayName.withCString { displayNamePointer in
                    try sharedFile.contentType.withCString { contentTypePointer in
                        guard let resultPointer = opendrive_share_upload(
                            serverBaseURLPointer,
                            filePathPointer,
                            displayNamePointer,
                            contentTypePointer
                        ) else {
                            throw ShareError("Upload failed before the server returned a response.")
                        }

                        defer {
                            opendrive_share_result_free(resultPointer)
                        }

                        let result = resultPointer.pointee
                        if let errorPointer = result.error_message {
                            throw ShareError(String(cString: errorPointer))
                        }

                        guard let shareURLPointer = result.share_url else {
                            throw ShareError("Upload failed before the server returned a response.")
                        }

                        return String(cString: shareURLPointer)
                    }
                }
            }
        }
    }

    nonisolated private func serverBaseURL() throws -> URL {
        if let override = ProcessInfo.processInfo.environment["OPENDRIVE_SERVER_URL"]?.trimmingCharacters(in: .whitespacesAndNewlines),
           !override.isEmpty,
           let url = URL(string: override),
           url.scheme != nil,
           url.host != nil {
            return url
        }

        if let configured = Bundle.main.object(forInfoDictionaryKey: "OpenDriveServerURL") as? String,
           let url = URL(string: configured),
           url.scheme != nil,
           url.host != nil {
            return url
        }

        throw ShareError("Missing OpenDriveServerURL in the share extension configuration.")
    }

}

private struct ShareError: LocalizedError {
    let message: String

    init(_ message: String) {
        self.message = message
    }

    var errorDescription: String? {
        message
    }
}
