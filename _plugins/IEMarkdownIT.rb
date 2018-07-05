require 'open3'

# Requires node v6+
# => npm install --no-bin-links
class Jekyll::Converters::Markdown::IEMarkdownIT
  def initialize(config)
    @config = config
    STDERR.puts 'Jekyll::Converters::Markdown::IEMarkdownIT::config'
  end

  def convert(content)
    STDOUT.puts 'Jekyll::Converters::Markdown::IEMarkdownIT::convert'

    cmd = 'node _plugins/ie-markdown-it.js'
    # Hack to see if we are generating the excerpt or main page
    if caller.to_s.include? "excerpt.rb"
      STDOUT.puts "Rendering excerpt"
      cmd += ' --summary'
    end

    markdown = ""
    Open3.popen2e(cmd) do |stdin, stdout_err, wait_thr|
      stdin.puts(content)
      stdin.close

      markdown = stdout_err.read

      unless wait_thr.value.success?
        abort "Failed to markdown content"
      end
    end

    markdown
  end
end
