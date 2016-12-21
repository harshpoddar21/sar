class PdfMailer < ApplicationMailer

    def sendFile(recipient,fileNameAbsolute,subject)
      attachments[fileNameAbsolute.split("/").last] = File.read(fileNameAbsolute)
      mail(:to => recipient, :subject => subject)
    end

end
