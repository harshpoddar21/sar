module Crypto
  class KeyGenerator
    SUGGEST_KEY="blablablablablablablablablablablabla"
    def self.getKeyGenerator

      ActiveSupport::MessageEncryptor.new(SUGGEST_KEY)

    end
    def self.simpleEncryption message
      return message.unpack("H*")[0]
    end
    def self.simpleDecryption message
      return [message].pack("H*")
    end
  end
end