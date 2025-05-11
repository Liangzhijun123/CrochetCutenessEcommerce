import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, AlertTriangle } from "lucide-react"

export default function TestingGuidelines() {
  return (
    <div className="mt-4 space-y-8">
      <div>
        <h2 className="text-xl font-semibold mb-4">Pattern Testing Guidelines</h2>
        <p className="text-muted-foreground mb-6">
          Follow these guidelines to be an effective pattern tester and earn higher ratings.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Before Testing</CardTitle>
              <CardDescription>Preparation steps</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <span>Review pattern requirements and deadlines</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <span>Gather all required materials</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <span>Set aside dedicated time to complete the test</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <span>Read through the entire pattern before starting</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">During Testing</CardTitle>
              <CardDescription>Testing process</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <span>Take notes as you work through the pattern</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <span>Document any unclear instructions or potential errors</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <span>Take photos at different stages of the project</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <span>Track time spent on each section</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">After Completion</CardTitle>
              <CardDescription>Feedback submission</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <span>Take high-quality photos of the finished item</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <span>Provide constructive, detailed feedback</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <span>Submit your feedback and photos before the deadline</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <span>Be available for follow-up questions from the designer</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold mb-4">Frequently Asked Questions</h3>

        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger>How does the application process work?</AccordionTrigger>
            <AccordionContent>
              <p className="mb-2">
                When you apply to test a pattern, the designer reviews your testing history, skill level, and
                application note. If selected, you'll receive a notification and the pattern will be added to your
                testing queue.
              </p>
              <p>
                Designers often look for testers with different experience levels, so don't be discouraged if you're
                new. Many designers specifically want beginner testers to ensure their patterns are accessible to all
                skill levels.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-2">
            <AccordionTrigger>What should I include in my feedback?</AccordionTrigger>
            <AccordionContent>
              <p className="mb-2">Effective feedback should include:</p>
              <ul className="list-disc pl-5 mb-2 space-y-1">
                <li>Clear identification of any errors or confusing instructions</li>
                <li>Suggestions for improvements</li>
                <li>Time taken for each section</li>
                <li>Photos of your work in progress and finished item</li>
                <li>Any modifications you made and why</li>
                <li>Overall impression of the pattern's clarity and enjoyability</li>
              </ul>
              <p>
                Remember to be constructive and specific. "The instructions were confusing" is less helpful than "In row
                3, I wasn't sure if the instruction to 'sc in next st' referred to the chain space or the next stitch."
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-3">
            <AccordionTrigger>How do I earn badges and level up?</AccordionTrigger>
            <AccordionContent>
              <p className="mb-2">
                You earn XP for each pattern test you complete. The amount depends on the pattern's difficulty level,
                completeness of your feedback, and designer rating. More complex patterns and exceptional feedback earn
                more XP.
              </p>
              <p className="mb-2">
                Badges are earned by meeting specific achievements, such as testing a certain number of patterns in a
                category, maintaining a testing streak, or receiving high ratings from designers.
              </p>
              <p>
                Your tester level increases as you accumulate XP, with each level requiring more XP than the last.
                Higher levels unlock access to more exclusive testing opportunities.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-4">
            <AccordionTrigger>What if I can't complete a test on time?</AccordionTrigger>
            <AccordionContent>
              <div className="flex items-start gap-2 mb-3">
                <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
                <p className="text-amber-700">
                  Missing deadlines can affect your tester rating and may impact your ability to be selected for future
                  tests.
                </p>
              </div>
              <p className="mb-2">
                If you realize you won't be able to complete a test on time, communicate with the designer as soon as
                possible. Many designers are understanding of unexpected circumstances if you let them know in advance.
              </p>
              <p>
                You can request an extension, but it's at the designer's discretion to grant it. If you consistently
                struggle with deadlines, consider applying for patterns with longer testing periods or fewer
                requirements.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-5">
            <AccordionTrigger>Can I share photos of my test project on social media?</AccordionTrigger>
            <AccordionContent>
              <div className="flex items-start gap-2 mb-3">
                <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
                <p className="text-amber-700">
                  Always check with the designer first before sharing any images or details about test patterns.
                </p>
              </div>
              <p>
                Most designers consider test patterns confidential until they're released. Some may allow you to share
                "sneak peeks" that don't reveal the full design, while others might ask you to wait until the pattern
                launches. Always respect the designer's wishes and include proper credit and links when sharing.
              </p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold mb-4">Code of Conduct</h3>

        <Card className="bg-muted">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <p className="text-sm">As a pattern tester, I commit to:</p>

              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <span>Providing honest, constructive feedback that helps designers improve their patterns</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <span>Meeting agreed-upon deadlines or communicating proactively if I need more time</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <span>Respecting the confidentiality of test patterns and not sharing without permission</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <span>Being respectful and professional in all communications with designers and other testers</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <span>Supporting other testers and contributing to a positive community environment</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <span>Never sharing or selling test patterns or using them for commercial purposes</span>
                </li>
              </ul>

              <p className="text-sm text-muted-foreground">
                Violation of these principles may result in reduced tester ratings, removal from testing opportunities,
                or in severe cases, suspension from the testing program.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
